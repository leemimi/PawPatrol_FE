import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        nickname: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/register`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                        nickname: formData.nickname,
                    }),
                }
            );

            if (response.ok) {
                alert('회원가입이 완료되었습니다.');
                navigate('/login');
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('Register error:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <h2 className="text-center text-3xl font-bold">회원가입</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="이메일"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="비밀번호"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            name="passwordConfirm"
                            placeholder="비밀번호 확인"
                            required
                            value={formData.passwordConfirm}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="nickname"
                            placeholder="닉네임"
                            required
                            value={formData.nickname}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        가입하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;