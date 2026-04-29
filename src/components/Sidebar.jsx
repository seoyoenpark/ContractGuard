import { useNavigate, useLocation } from 'react-router-dom';
import { isAdmin } from '../utils/auth';
import folderIcon from '../../src/assets/images/folder.png';
import styles from './Sidebar.module.css';

function Sidebar({ type = 'user' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const userMenus = [
    {
      group: '메뉴',
      items: [{ label: '서비스 소개', path: '/' }],
    },
    {
      group: '서비스 이용하기',
      items: [{ label: '계약서 검사', path: '/contract' }],
    },
    {
      group: '회원 정보',
      items: [{ label: '마이페이지', path: '/mypage' }],
    },
    ...(isAdmin()
      ? [{
          group: '서비스 관리',
          items: [{ label: '관리자 페이지', path: '/admin' }],
        }]
      : []),
  ];

  const adminMenus = [
    {
      group: '사용자 관리',
      items: [{ label: '전체 사용자 관리', path: '/admin/users' }],
    },
    {
      group: '통계 및 분석',
      items: [
        { label: '계약서 관련 통계', path: '/admin/stats/contract' },
        { label: '독소조항 관련 통계', path: '/admin/stats/toxic' },
        { label: '사용자 관련 통계', path: '/admin/stats/user' },
        { label: '에러 로그 조회', path: '/admin/stats/error' },
        { label: 'AI 모델 사용량 추이', path: '/admin/stats/ai' },
      ],
    },
    {
      group: '사용자 페이지',
      items: [{ label: '사용자 페이지로 이동하기', path: '/' }],
    },
  ];

  const menus = type === 'admin' ? adminMenus : userMenus;

  return (
    <nav className={styles.sidebar}>
      {menus.map((section) => (
        <div key={section.group} className={styles.section}>
          <p className={styles.groupLabel}>{section.group}</p>
          {section.items.map((item) => (
            <button
              key={item.path}
              className={`${styles.item} ${location.pathname === item.path ? styles.active : ''}`}
              onClick={() => navigate(item.path)}
            >
            <img src={folderIcon} alt="폴더 아이콘" className={styles.folderIcon} />
              {item.label}
            </button>
          ))}
          <hr className={styles.divider} />
        </div>
      ))}
    </nav>
  );
}

export default Sidebar;