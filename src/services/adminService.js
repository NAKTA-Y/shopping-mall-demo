const db = require('../repositories/mysql/db');

/**
 * 유저별 구매/리뷰 통계
 *
 * 의도적으로 비효율적인 쿼리:
 * - 상관 서브쿼리(correlated subquery)로 유저마다 개별 집계
 *   → 유저 1,000명 * 서브쿼리 5개 = 사실상 5,000번 쿼리
 * - ORDER BY total_spent: 계산값이라 인덱스 불가 → filesort
 * - GROUP_CONCAT 안에서 또 3중 JOIN
 */
async function getUserStats({ page = 1, limit = 20 } = {}) {
  page = Math.max(1, parseInt(page) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (page - 1) * limit;

  const [rows] = await db.raw(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.created_at AS joined_at,
      (
        SELECT COUNT(*)
        FROM orders
        WHERE user_id = u.id
      ) AS order_count,
      (
        SELECT COALESCE(SUM(oi.unit_price * oi.quantity), 0)
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = u.id
      ) AS total_spent,
      (
        SELECT COUNT(*)
        FROM reviews
        WHERE user_id = u.id
      ) AS review_count,
      (
        SELECT ROUND(AVG(rating), 2)
        FROM reviews
        WHERE user_id = u.id
      ) AS avg_rating,
      (
        SELECT GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ')
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p     ON oi.product_id = p.id
        JOIN categories c   ON p.category_id = c.id
        WHERE o.user_id = u.id
      ) AS purchased_categories
    FROM users u
    ORDER BY total_spent DESC
    LIMIT ? OFFSET ?
  `, [limit, offset]);

  const [[{ total }]] = await db.raw(`SELECT COUNT(*) as total FROM users`);

  const totalPages = Math.ceil(total / limit);
  return {
    items: rows,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * 전체 요약 통계
 *
 * 의도적으로 비효율적인 쿼리:
 * - 각 지표를 개별 쿼리로 분리해서 DB 왕복 10번
 * - best_seller: sold_count 인덱스 있어도 풀스캔 유도 (LIKE 추가)
 * - top_category: 3중 JOIN + 서브쿼리 중첩
 */
async function getSummary() {
  const [[{ total_users }]] = await db.raw(`SELECT COUNT(*) as total_users FROM users`);
  const [[{ active_products }]] = await db.raw(`SELECT COUNT(*) as active_products FROM products WHERE stock > 0`);
  const [[{ total_orders }]] = await db.raw(`SELECT COUNT(*) as total_orders FROM orders`);
  const [[{ delivered_orders }]] = await db.raw(`SELECT COUNT(*) as delivered_orders FROM orders WHERE status = 'delivered'`);
  const [[{ cancelled_orders }]] = await db.raw(`SELECT COUNT(*) as cancelled_orders FROM orders WHERE status = 'cancelled'`);
  const [[{ gross_revenue }]] = await db.raw(`SELECT COALESCE(SUM(total_amount), 0) as gross_revenue FROM orders WHERE status != 'cancelled'`);
  const [[{ total_reviews }]] = await db.raw(`SELECT COUNT(*) as total_reviews FROM reviews`);
  const [[{ avg_review_rating }]] = await db.raw(`SELECT ROUND(AVG(rating), 2) as avg_review_rating FROM reviews`);
  const [[{ best_seller }]] = await db.raw(`
    SELECT name as best_seller
    FROM products
    WHERE name LIKE '%%'
    ORDER BY sold_count DESC
    LIMIT 1
  `);
  const [[{ top_category }]] = await db.raw(`
    SELECT c.name as top_category
    FROM categories c
    JOIN products p      ON c.id = p.category_id
    JOIN order_items oi  ON p.id = oi.product_id
    JOIN orders o        ON oi.order_id = o.id
    WHERE o.status != 'cancelled'
    GROUP BY c.id, c.name
    ORDER BY SUM(oi.quantity) DESC
    LIMIT 1
  `);

  return {
    total_users,
    active_products,
    total_orders,
    delivered_orders,
    cancelled_orders,
    gross_revenue,
    total_reviews,
    avg_review_rating,
    best_seller,
    top_category,
  };
}

/**
 * 카테고리별 매출/리뷰 집계
 *
 * 의도적으로 비효율적인 쿼리:
 * - 각 카테고리마다 상관 서브쿼리로 개별 집계
 * - reviews는 products를 경유하는 2단계 서브쿼리
 * - ORDER BY revenue: 계산값 → filesort
 */
async function getCategoryStats() {
  const [rows] = await db.raw(`
    SELECT
      c.id,
      c.name AS category_name,
      (
        SELECT COUNT(*)
        FROM products
        WHERE category_id = c.id
      ) AS product_count,
      (
        SELECT COUNT(DISTINCT oi.order_id)
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        WHERE p.category_id = c.id
      ) AS order_count,
      (
        SELECT COALESCE(SUM(oi.quantity), 0)
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        WHERE p.category_id = c.id
      ) AS units_sold,
      (
        SELECT COALESCE(SUM(oi.unit_price * oi.quantity), 0)
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        JOIN orders o       ON oi.order_id = o.id
        WHERE p.category_id = c.id
          AND o.status != 'cancelled'
      ) AS revenue,
      (
        SELECT ROUND(AVG(r.rating), 2)
        FROM products p
        JOIN reviews r ON p.id = r.product_id
        WHERE p.category_id = c.id
      ) AS avg_rating,
      (
        SELECT COUNT(*)
        FROM products p
        JOIN reviews r ON p.id = r.product_id
        WHERE p.category_id = c.id
      ) AS review_count
    FROM categories c
    ORDER BY revenue DESC
  `);

  return rows;
}

module.exports = { getUserStats, getSummary, getCategoryStats };
