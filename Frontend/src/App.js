import { BrowserRouter, Routes, Route } from "react-router-dom";
import TimetableList from "./pages/TimetableList";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import SubjectList from "./pages/SubjectList";
import FacultiesList from "./pages/FacultiesList";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import FacultyList from "./pages/FacultiesList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AnalyticsDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AnalyticsDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/timetable"
          element={
            <PrivateRoute>
              <TimetableList />
            </PrivateRoute>
          }
        />
        <Route
          path="/faculties"
          element={
            <PrivateRoute>
              <FacultiesList />
            </PrivateRoute>
          }
        />
        <Route
          path="/subjects"
          element={
            <PrivateRoute>
              <SubjectList />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;