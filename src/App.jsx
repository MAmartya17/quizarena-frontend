import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import MovingBackground from './components/MovingBackground'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import QuizList from './pages/QuizList'
import CreateQuiz from './pages/CreateQuiz'
import TakeQuiz from './pages/TakeQuiz'
import Result from './pages/Result'
import MyScores from './pages/MyScores'
import ManageQuiz from './pages/ManageQuiz'
import MyQuizzes from './pages/MyQuizzes'
import QuizLeaderboard from "./pages/QuizLeaderboard";
import CreateContest from "./pages/CreateContest";
import ContestPage from "./pages/ContestPage";
import MyContests from "./pages/MyContests";
import AiQuizBuilder from "./pages/AiQuizBuilder";
export default function App() {
  const location = useLocation()
  return (
    <>
      <MovingBackground />
      <Navbar />
      <div key={location.pathname} className="page-enter">
        <Routes location={location}>
          
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/quizzes" element={<QuizList />} />
          <Route path="/quiz/:id" element={<PrivateRoute><TakeQuiz /></PrivateRoute>} />
          <Route path="/result" element={<PrivateRoute><Result /></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><CreateQuiz /></PrivateRoute>} />
          <Route path="/my-quizzes" element={<PrivateRoute><MyQuizzes /></PrivateRoute>} />
          <Route path="/manage/:id" element={<PrivateRoute><ManageQuiz /></PrivateRoute>} />
          <Route path="/scores" element={<PrivateRoute><MyScores /></PrivateRoute>} />
          <Route path="/quiz/:id/leaderboard" element={<QuizLeaderboard />} />
          <Route path="/contests" element={<MyContests />} />
          <Route path="/contests/new" element={<CreateContest />} />
          <Route path="/contest/:code" element={<ContestPage />} />
          <Route path="/ai-quiz" element={<PrivateRoute><AiQuizBuilder /></PrivateRoute>} />
          
        </Routes>
      </div>
    </>
  )
}