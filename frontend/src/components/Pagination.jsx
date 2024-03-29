import PropTypes from 'prop-types';

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  return (
    <nav>
      <ul className="pagination pagination-dark">
        {Array.from({ length: totalPages }, (_, index) => (
          <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
            <button onClick={() => onPageChange(index + 1)} className="page-link">{index + 1}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

Pagination.propTypes = {
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired
}

export default Pagination;
