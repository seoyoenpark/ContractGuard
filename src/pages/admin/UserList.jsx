import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import {
  getUserList,
  getUserDetail,
  updateUserRole,
  deleteUser,
} from '../../api/admin';
import styles from './UserList.module.css';

function UserList() {
  /* ── 더미 데이터 (설계서 p.108 /api/admin/users 응답 스펙과 일치) ──
     설계 스펙 필드: user_id, name, email, role, gender (birthDate는 상세 조회에만 존재) */
  const [users, setUsers] = useState([
    { user_id: 1, name: '홍길동', email: 'hong@example.com', gender: 'MALE',   role: 'USER' },
    { user_id: 2, name: '김서연', email: 'seo@example.com',  gender: 'FEMALE', role: 'USER' },
    { user_id: 3, name: '이로운', email: 'lee@example.com',  gender: 'MALE',   role: 'ADMIN' },
    { user_id: 4, name: '박지민', email: 'park@example.com', gender: 'FEMALE', role: 'USER' },
    { user_id: 5, name: '최영수', email: 'choi@example.com', gender: 'MALE',   role: 'USER' },
    { user_id: 6, name: '정다은', email: 'jung@example.com', gender: 'FEMALE', role: 'USER' },
    { user_id: 7, name: '강민호', email: 'kang@example.com', gender: 'MALE',   role: 'ADMIN' },
    { user_id: 8, name: '윤하늘', email: 'yoon@example.com', gender: 'FEMALE', role: 'USER' },
  ]);

  // 상세 모달 상태
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /* ── API 연동 시 주석 해제 ──
  useEffect(() => {
    let cancelled = false;
    const fetchUsers = async () => {
      try {
        const res = await getUserList();
        // 설계서 p.108: 응답은 { data: { users: [...] } } → axios wrap 뒤 res.data.data.users
        if (!cancelled) setUsers(res.data.data?.users || []);
      } catch {
        console.error('사용자 목록 로딩 실패');
      }
    };
    fetchUsers();
    return () => { cancelled = true; };
  }, []);
  */

  // 행 클릭 → 설계서 p.109 GET /api/admin/users/:id 로 상세 조회
  const handleRowClick = async (userId) => {
    try {
      setDetailLoading(true);
      setSelectedUser({ loading: true });   // 모달은 즉시 열고 로딩 표기

      /* ── API 연동 시 이 블록 사용 ──
      const res = await getUserDetail(userId);
      setSelectedUser(res.data.data);
      */

      // ── 더미 모드: 목록에서 기본 필드를 가져와 상세 필드(birthDate 등) 추가
      const base = users.find((u) => u.user_id === userId);
      if (base) {
        setSelectedUser({
          ...base,
          birthDate: '2000-01-15',
          created_at: '2026-03-01T10:00:00.000Z',
          updated_at: '2026-03-02T08:00:00.000Z',
        });
      }
    } catch {
      alert('사용자 상세 정보 조회에 실패했습니다.');
      setSelectedUser(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => setSelectedUser(null);

  const handleRoleChange = async (userId, role, e) => {
    e.stopPropagation();   // 행 클릭 전파 방지
    const label = role === 'ADMIN' ? '관리자' : '사용자';
    if (!window.confirm(`해당 회원을 ${label}로 변경하시겠습니까?`)) return;
    try {
      await updateUserRole(userId, role);
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role } : u))
      );
    } catch {
      alert('권한 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (userId, e) => {
    e.stopPropagation();   // 행 클릭 전파 방지
    if (!window.confirm('해당 회원을 강제 탈퇴 처리하시겠습니까?')) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    } catch {
      alert('탈퇴 처리에 실패했습니다.');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layout}>
        <Sidebar type="admin" />
        <main className={styles.main}>
          <h2 className={styles.pageTitle}>전체 사용자 목록</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Index</th>
                  <th>이름</th>
                  <th>아이디</th>
                  <th>이메일</th>
                  <th>성별</th>
                  <th>사용자/관리자</th>
                  <th>회원 탈퇴</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user.user_id}
                    className={styles.row}
                    onClick={() => handleRowClick(user.user_id)}
                  >
                    <td>{idx + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.user_id}</td>
                    <td>{user.email}</td>
                    <td>{user.gender === 'MALE' ? '남성' : '여성'}</td>
                    <td>
                      <div className={styles.roleToggle}>
                        <button
                          className={`${styles.roleBtn} ${user.role === 'USER' ? styles.roleBtnActive : ''}`}
                          onClick={(e) => handleRoleChange(user.user_id, 'USER', e)}
                        >
                          사용자
                        </button>
                        <button
                          className={`${styles.roleBtn} ${user.role === 'ADMIN' ? styles.roleBtnActive : ''}`}
                          onClick={(e) => handleRoleChange(user.user_id, 'ADMIN', e)}
                        >
                          관리자
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        className={styles.deleteBtn}
                        onClick={(e) => handleDelete(user.user_id, e)}
                      >
                        탈퇴
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* 사용자 상세 정보 모달 */}
      {selectedUser && (
        <div className={styles.modalOverlay} onClick={closeDetailModal}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeBtn}
              onClick={closeDetailModal}
              aria-label="닫기"
            >
              ×
            </button>
            <h3 className={styles.modalTitle}>사용자 상세 정보 조회</h3>

            {detailLoading || selectedUser.loading ? (
              <p className={styles.modalLoading}>불러오는 중…</p>
            ) : (
              <>
                <div className={styles.fieldBox}>
                  <span className={styles.fieldLabel}>이름</span>
                  <span className={styles.fieldValue}>{selectedUser.name || '-'}</span>
                </div>

                <div className={styles.fieldBox}>
                  <span className={styles.fieldLabel}>아이디</span>
                  <span className={styles.fieldValue}>{selectedUser.user_id ?? '-'}</span>
                </div>

                <div className={styles.fieldBox}>
                  <span className={styles.fieldLabel}>이메일</span>
                  <span className={styles.fieldValue}>{selectedUser.email || '-'}</span>
                </div>

                <div className={styles.fieldBox}>
                  <span className={styles.fieldLabel}>생년월일</span>
                  <span className={styles.fieldValue}>{selectedUser.birthDate || '-'}</span>
                </div>

                {/* 성별: 읽기 전용 토글 (현재 값만 강조) */}
                <div className={styles.fieldBox}>
                  <span className={styles.fieldLabel}>성별</span>
                  <div className={styles.toggleRow}>
                    <span
                      className={`${styles.toggleItem} ${
                        selectedUser.gender === 'FEMALE' ? styles.toggleActive : ''
                      }`}
                    >
                      여성
                    </span>
                    <span
                      className={`${styles.toggleItem} ${
                        selectedUser.gender === 'MALE' ? styles.toggleActive : ''
                      }`}
                    >
                      남성
                    </span>
                  </div>
                </div>

                {/* 역할: 읽기 전용 토글 (현재 값만 강조) */}
                <div className={styles.fieldBox}>
                  <span className={styles.fieldLabel}>역할</span>
                  <div className={styles.toggleRow}>
                    <span
                      className={`${styles.toggleItem} ${
                        selectedUser.role === 'USER' ? styles.toggleActive : ''
                      }`}
                    >
                      사용자
                    </span>
                    <span
                      className={`${styles.toggleItem} ${
                        selectedUser.role === 'ADMIN' ? styles.toggleActive : ''
                      }`}
                    >
                      관리자
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;