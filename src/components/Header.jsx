import { useNavigate, useLocation } from 'react-router-dom';
import { logoutApi } from '../api/auth';
import { logout, isLoggedIn, isAdmin, getUserIdFromToken } from '../utils/auth';
import styles from './Header.module.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = getUserIdFromToken();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
    }
    logout();
    navigate('/');
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
          <button className={styles.btn}>
          {userId ?? '회원'}님
          </button>
        ) : (
          <button className={styles.btn} onClick={() => navigate('/Signup')}>
            회원가입
          </button>
        )}
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