const ApiError = require('../utils/ApiError');

/**
 * Admin 통계 서비스
 *
 * in-memory 구현체에서는 동작하지 않습니다.
 * MySQL 구현체 연결 후 사용하세요.
 *
 * MySQL 구현체를 만들 때 아래 SQL을 그대로 사용하면 됩니다.
 * 슬로우 쿼리 테스트 목적으로 인덱스 없는 컬럼 정렬 + 대용량 JOIN을 의도적으로 포함합니다.
 */

/**
 * 유저별 구매/리뷰 통계 (핵심 슬로우 쿼리)
 *
 * SQL:
 *   SELECT
 *     u.id,
 *     u.name,
 *     u.email,
 *     u.created_at                                        AS joined_at,
 *     COUNT(DISTINCT o.id)                                AS order_count,
 *     COALESCE(SUM(oi.unit_price * oi.quantity), 0)       AS total_spent,
 *     COUNT(DISTINCT r.id)                                AS review_count,
 *     ROUND(AVG(r.rating), 2)                             AS avg_rating,
 *     COUNT(DISTINCT p.category_id)                       AS category_diversity,
 *     GROUP_CONCAT(DISTINCT c.name ORDER BY c.name)       AS purchased_categories,
 *     MAX(o.created_at)                                   AS last_order_at
 *   FROM users u
 *   LEFT JOIN orders o        ON u.id = o.user_id
 *   LEFT JOIN order_items oi  ON o.id = oi.order_id
 *   LEFT JOIN products p      ON oi.product_id = p.id
 *   LEFT JOIN categories c    ON p.category_id = c.id
 *   LEFT JOIN reviews r       ON r.user_id = u.id
 *   GROUP BY u.id, u.name, u.email, u.created_at
 *   ORDER BY total_spent DESC          -- 계산값 정렬 → filesort 발생
 *   LIMIT :limit OFFSET :offset;
 *
 * 예상 실행계획:
 *   - users(1,000) × orders(50,000) × order_items(~150,000) × reviews(100,000) 조인
 *   - total_spent는 집계 결과라 인덱스 불가 → filesort
 *   - 인덱스 최적화 전: 수초 소요 예상
 */
async function getUserStats({ page, limit }) {
  throw new ApiError(501, 'MySQL 구현체 연결 후 사용 가능합니다. adminService.js의 SQL 주석을 참고하세요.');
}

/**
 * 전체 요약 통계
 *
 * SQL:
 *   SELECT
 *     (SELECT COUNT(*) FROM users)                                      AS total_users,
 *     (SELECT COUNT(*) FROM products WHERE stock > 0)                   AS active_products,
 *     (SELECT COUNT(*) FROM orders)                                     AS total_orders,
 *     (SELECT COUNT(*) FROM orders WHERE status = 'delivered')          AS delivered_orders,
 *     (SELECT COUNT(*) FROM orders WHERE status = 'cancelled')          AS cancelled_orders,
 *     (SELECT COALESCE(SUM(total_amount), 0)
 *       FROM orders WHERE status != 'cancelled')                        AS gross_revenue,
 *     (SELECT COUNT(*) FROM reviews)                                    AS total_reviews,
 *     (SELECT ROUND(AVG(rating), 2) FROM reviews)                       AS avg_review_rating,
 *     (SELECT name FROM products ORDER BY sold_count DESC LIMIT 1)      AS best_seller,
 *     (SELECT c.name FROM categories c
 *       JOIN products p      ON c.id = p.category_id
 *       JOIN order_items oi  ON p.id = oi.product_id
 *       JOIN orders o        ON oi.order_id = o.id AND o.status != 'cancelled'
 *       GROUP BY c.id
 *       ORDER BY SUM(oi.quantity) DESC
 *       LIMIT 1)                                                        AS top_category;
 */
async function getSummary() {
  throw new ApiError(501, 'MySQL 구현체 연결 후 사용 가능합니다. adminService.js의 SQL 주석을 참고하세요.');
}

/**
 * 카테고리별 매출/리뷰 집계
 *
 * SQL:
 *   SELECT
 *     c.id,
 *     c.name                                              AS category_name,
 *     COUNT(DISTINCT p.id)                                AS product_count,
 *     COUNT(DISTINCT oi.order_id)                         AS order_count,
 *     COALESCE(SUM(oi.quantity), 0)                       AS units_sold,
 *     COALESCE(SUM(oi.unit_price * oi.quantity), 0)       AS revenue,
 *     ROUND(AVG(r.rating), 2)                             AS avg_rating,
 *     COUNT(DISTINCT r.id)                                AS review_count
 *   FROM categories c
 *   LEFT JOIN products p      ON c.id = p.category_id
 *   LEFT JOIN order_items oi  ON p.id = oi.product_id
 *   LEFT JOIN orders o        ON oi.order_id = o.id AND o.status != 'cancelled'
 *   LEFT JOIN reviews r       ON p.id = r.product_id
 *   GROUP BY c.id, c.name
 *   ORDER BY revenue DESC;
 */
async function getCategoryStats() {
  throw new ApiError(501, 'MySQL 구현체 연결 후 사용 가능합니다. adminService.js의 SQL 주석을 참고하세요.');
}

module.exports = { getUserStats, getSummary, getCategoryStats };
