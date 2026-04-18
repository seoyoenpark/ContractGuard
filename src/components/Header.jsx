import { useNavigate, useLocation } from 'react-router-dom';
import { logout, isLoggedIn, isAdmin } from '../utils/auth';
import styles from './Header.module.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    if (location.pathname.startsWith('/admin')) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <header className={styles.header}>
      <span className={styles.logo} onClick={handleLogoClick}>
        Contract Guard
      </span>
      <div className={styles.right}>
        {isLoggedIn() ? (
          <button className={styles.btn} onClick={handleLogout}>
            로그아웃
          </button>
        ) : (
          <button className={styles.btn} onClick={() => navigate('/login')}>
            로그인
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;