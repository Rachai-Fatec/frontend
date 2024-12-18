import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './login-varianteA.css';
import './login-varianteB.css';

function Login() {
    const navigate = useNavigate();
    const [variant, setVariant] = useState('A');
    const [formData, setFormData] = useState({
        email: '',
        senha: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Escolhe aleatoriamente entre 'A' e 'B'
        const randomVariant = window.crypto.getRandomValues(new Uint32Array(1))[0] % 2 === 0 ? 'A' : 'B';
        setVariant(randomVariant);

        // Cria uma tag <link> para carregar o CSS apropriado
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = randomVariant === 'A' ? '/path/to/cadastro-variantA.css' : '/path/to/cadastro-variantB.css';
        document.head.appendChild(link);

        // Adiciona a classe ao body
        document.body.classList.add(`variant-${randomVariant}`);

        // Limpa o link e a classe quando o componente é desmontado
        return () => {
            document.head.removeChild(link);
            document.body.classList.remove(`variant-${randomVariant}`);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'E-mail inválido';
        } else if (!formData.email.endsWith('@fatec.sp.gov.br')) {
            newErrors.email = 'E-mail deve ser @fatec.sp.gov.br';
        }
        if (!formData.senha) {
            newErrors.senha = 'Senha é obrigatória';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        console.log('Form Data:', formData);
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            console.log('Success:', data);

            if (data.token && data.userInfo) {
                // Armazena o token e as informações do usuário no LocalStorage
                const expirationTime = new Date().getTime() + 6 * 60 * 60 * 1000; // 6 horas
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.userInfo));
                localStorage.setItem('expirationTime', expirationTime);

                // Redireciona para a página /home
                setTimeout(() => navigate('/home'), 3000);
            } else {
                console.error('Erro ao fazer login. Verifique suas credenciais.');
                setErrors({ login: 'Erro ao fazer login. Verifique suas credenciais.' });
            }
        } catch (error) {
            console.error('Error:', error);
            setErrors({ login: 'Erro ao fazer login. Verifique suas credenciais.' });
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={`container-login variant-${variant}`}>
            <img
                className={`logo-rachai1-login variant-${variant}`}
                src={variant === 'A' ? '/assets/img/rachai.png' : '/assets/img/rachai2.png'}
                alt="Logo Rachaí"
            />
            <form onSubmit={handleSubmit}>
                <div className={`input-container-login variant-${variant}`}>
                    <i className="fas fa-envelope"></i>
                    <input
                        className={`input-field-login variant-${variant}`}
                        type="email"
                        name="email"
                        placeholder="E-mail: usuario@fatec.sp.gov.br"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                {errors.email && <span className={`error-login variant-${variant}`}>{errors.email}</span>}
                <div className={`input-container-login variant-${variant}`}>
                    <input
                        className={`input-field-login variant-${variant}`}
                        type={showPassword ? "text" : "password"}
                        name="senha"
                        placeholder="Senha"
                        value={formData.senha}
                        onChange={handleChange}
                    />
                    <i
                        className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} password-toggle`}
                        onClick={togglePasswordVisibility}>   
                    </i>
                </div>
                {errors.senha && <span className={`error-login variant-${variant}`}>{errors.senha}</span>}
                {errors.login && <span className={`error-login variant-${variant}`}>{errors.login}</span>}
                <br />
                <button type="submit" className={`button-button-login variant-${variant}`}>
                    Login
                </button>
            </form>
        </div>
    );
}

export default Login;