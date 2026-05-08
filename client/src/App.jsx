import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CreateCourse from "./pages/CreateCourse";
import Enrollments from "./pages/Enrollments";
import Forum from "./pages/Forum";
import ManageCourseContent from "./pages/ManageCourseContent";
import MyLearning from "./pages/MyLearning";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/create-course" element={<CreateCourse />} />
      <Route path="/enrollments" element={<Enrollments />} />
      <Route path="/forum" element={<Forum />} />
      <Route path="/manage-course-content" element={<ManageCourseContent />} />
      <Route path="/my-learning" element={<MyLearning />} />
    </Routes>
  );
}


export default App;