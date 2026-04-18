import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { getUserList, updateUserRole, deleteUser } from '../../api/admin';
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

  /* ── API 연동 시 주석 해제 ──
  useEffect(() => {
    let cancelled = false;
    const fetchUsers = async () => {
      try {
        const res = await getUserList();
        // 설계서 p.108: 응답은 { data: { users: [...] } } → axios wrap 뒤에는 res.data.data.users
        if (!cancelled) setUsers(res.data.data?.users || []);
      } catch {
        console.error('사용자 목록 로딩 실패');
      }
    };
    fetchUsers();
    return () => { cancelled = true; };
  }, []);
  */

  const handleRoleChange = async (userId, role) => {
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

  const handleDelete = async (userId) => {
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
                  <tr key={user.user_id}>
                    <td>{idx + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.user_id}</td>
                    <td>{user.email}</td>
                    <td>{user.gender === 'MALE' ? '남성' : '여성'}</td>
                    <td>
                      <div className={styles.roleToggle}>
                        <button
                          className={`${styles.roleBtn} ${user.role === 'USER' ? styles.roleBtnActive : ''}`}
                          onClick={() => handleRoleChange(user.user_id, 'USER')}
                        >
                          사용자
                        </button>
                        <button
                          className={`${styles.roleBtn} ${user.role === 'ADMIN' ? styles.roleBtnActive : ''}`}
                          onClick={() => handleRoleChange(user.user_id, 'ADMIN')}
                        >
                          관리자
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(user.user_id)}
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
    </div>
  );
}

export default UserList;