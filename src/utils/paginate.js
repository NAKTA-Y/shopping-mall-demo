function paginate(array, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  return array.slice(offset, offset + limit);
}

function paginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

module.exports = { paginate, paginationMeta };
