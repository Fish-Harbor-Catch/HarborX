import React, { useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router";
import LoginPage from "./LoginPage.jsx";
import RegisterPage from "./RegisterPage.jsx";
import { AuthLayout } from "./components/SharedAuthComponents.jsx";

// The parent layout persists across /login and /register, including the slideshow.
export default function AuthPages({ onLogin, toast, demo }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  return (
    <AuthLayout>
      <Outlet
        context={{
          email,
          password,
          role,
          onEmailChange: setEmail,
          onPasswordChange: setPassword,
          onRoleChange: setRole,
          onLogin,
          toast,
          demo,
        }}
      />
    </AuthLayout>
  );
}

export function LoginRoute() {
  const props = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <LoginPage
      {...props}
      onRegister={() => navigate("/register", { state: location.state })}
    />
  );
}

export function RegisterRoute() {
  const props = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <RegisterPage
      {...props}
      onSignIn={() => navigate("/login", { state: location.state })}
    />
  );
}
