import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient.ts";
import { ToastProvider } from "./components/Toast/ToastContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.tsx";
import PublicRoute from "./components/ProtectedRoute/PublicRoute.tsx";
import RoleHomeRedirect from "./components/ProtectedRoute/RoleHomeRedirect.tsx";

import AppLayout from "./components/AppLayout/AppLayout.tsx";
import './App.css';

import SearchPage from "./pages/SearchPage/SearchPage.tsx";
import LoginFlow from "./pages/LoginPage/LoginFlow.tsx";
import SavedPage from "./pages/SavedPage/SavedPage.tsx";
import ArchivedPage from "./pages/ArchivedPage/ArchivedPage.tsx";
import ProjectPage from "./pages/ProjectPage/ProjectPage.tsx";
import ProjectLayout from "./components/ProjectLayout/ProjectLayout.tsx";
import AccountPage from "./pages/AccountPage/AccountPage.tsx";
import ProjectCreatePage from "./pages/ProjectCreatePage/ProjectCreatePage.tsx";
import ManageProjectPage from "./pages/ManageProjectPage/ManageProjectPage.tsx";
import TeacherPage from "./pages/TeacherPage/TeacherPage.tsx";
import AdminPage from "./pages/AdminPage/AdminPage.tsx";
import TeacherStudentsPage from "./pages/TeacherStudentsPage/TeacherStudentsPage.tsx";
import TeacherProjectReview from "./pages/TeacherProjectReview/TeacherProjectReview.tsx";
import IdeaMapPage from "./pages/map/MapPage.tsx";
import FilePreviewPage from "./pages/FilePreviewPage/FilePreviewPage.tsx";
import { GoogleOAuthProvider } from '@react-oauth/google';
import PWAGatekeeper from "./components/PWAGatekeeper/PWAGatekeeper.tsx";

const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '516425979009-77lsabevsqs8acugjt03e3p8krv4u1t2.apps.googleusercontent.com';

function App() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <ToastProvider>
                        <ThemeProvider>
                            <PWAGatekeeper>
                                <BrowserRouter>
                                    <Routes>
                                {/* Public route for unauthenticated users */}
                                <Route
                                    path="/login"
                                    element={
                                        <PublicRoute>
                                            <LoginFlow />
                                        </PublicRoute>
                                    }
                                />


                                {/* Protected routes with AppLayout (NavBar + BottomMenu) */}
                                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                                    <Route path="/" element={<RoleHomeRedirect />} />
                                    <Route path="/search" element={<SearchPage />} />
                                    <Route path="/saved" element={<SavedPage />} />
                                    <Route path="/archived" element={<ArchivedPage />} />
                                    <Route path="/account" element={<AccountPage />} />
                                    <Route path="/map" element={<IdeaMapPage />} />
                                    <Route
                                        path="/teacher"
                                        element={
                                            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                                                <TeacherPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/teacher/students"
                                        element={
                                            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                                                <TeacherStudentsPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin"
                                        element={
                                            <ProtectedRoute allowedRoles={['admin']}>
                                                <AdminPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                </Route>

                                {/* Protected routes with ProjectLayout (no NavBar, BottomMenu) */}
                                <Route element={<ProtectedRoute><ProjectLayout /></ProtectedRoute>}>
                                    <Route path="/project/:id" element={<ProjectPage />} />
                                    <Route
                                        path="/create-project"
                                        element={
                                            <ProtectedRoute allowedRoles={['student', 'admin']}>
                                                <ProjectCreatePage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/project/:id/manage"
                                        element={
                                            <ProtectedRoute allowedRoles={['student', 'admin']}>
                                                <ManageProjectPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/teacher/review/:id"
                                        element={
                                            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                                                <TeacherProjectReview />
                                            </ProtectedRoute>
                                        }
                                    />
                                </Route>

                                {/* File preview — standalone, no layout, no BottomMenu */}
                                <Route
                                    path="/file-preview"
                                    element={
                                        <ProtectedRoute>
                                            <FilePreviewPage />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Fallback route */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </BrowserRouter>
                        </PWAGatekeeper>
                    </ThemeProvider>
                </ToastProvider>
                </AuthProvider>
            </QueryClientProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
