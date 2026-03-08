import { BrowserRouter as Router,Routes,Route ,Navigate} from "react-router-dom"
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import EntryDetail from './pages/EntryDetail';
import Signup from './pages/Signup';
import {useAuth} from './context/AuthContext';
import AddEntry from "./pages/AddEntry";
import MyEntries from "./pages/MyEntries";
import MyAccount from "./pages/MyAccount";
import EditProfile from "./pages/EditProfile";
import AdminDashboard from "./pages/AdminDashboard";
import UpdateRole from "./pages/UpdateRole";
import SearchEntry from "./pages/SearchEntry";
import Community from './pages/Community';
import UserProfile from './pages/UserProfile';
import DeleteUser from "./pages/DeleteUser";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Footer from './pages/Footer';




const ProtectedRoute=({children})=>{
    const {user,loading}=useAuth();
    if(loading){
      return <div>Loading..</div>
    }
    if(!user){
      window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`
      return null;
    }
    if(!user.username){
      return <Navigate to="/signup" replace/>
    }

    return children;
}


const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="loading-screen">Verifying Admin Status...</div>;
    
    // Check role property
    if (user?.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return children;
}



function App() {
  const { user, loading } = useAuth();

  if(loading){
    return <div>Loading..</div>;
  }

  return (
    <Router>
      <Navbar/>
        <Routes>
          <Route path="/" element={user && !user.username ? <Navigate to='/signup' replace/>:<Feed/>}/>
          <Route path="/entry/:id" element={<EntryDetail/>}/>
          <Route path="/community" element={<Community />} />
          <Route path="/user/:username" element={<UserProfile />} />



          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route path="/find" element={<SearchEntry/>}/>
            <Route path="/add" element={
              <ProtectedRoute>
                  <AddEntry/>
                </ProtectedRoute>}/>
            <Route path="/signup" element={user && !user.username? <Signup/>:<Navigate to='/' replace/>}/>
            <Route path="/mine" element={
              <ProtectedRoute>
                  <MyEntries/>
                </ProtectedRoute>}/>
            <Route path="/signup" element={user && !user.username? <Signup/>:<Navigate to='/' replace/>}/>
            <Route path="/edit/:id" element={
              <ProtectedRoute>
                  <AddEntry/>
              </ProtectedRoute>}/>
            <Route path="/myaccount" element={
              <ProtectedRoute>
                  <MyAccount/>
              </ProtectedRoute>}/>
              <Route path="/edit-profile" element={
              <ProtectedRoute>
                  <EditProfile/>
              </ProtectedRoute>}/>
              <Route path="/admin/moderate" element={
                <AdminRoute>
                  <AdminDashboard />
              </AdminRoute>
              }/>
              <Route path="/admin/roles" element={
    <AdminRoute> 
        <UpdateRole />
    </AdminRoute>
} />
 <Route path="admin/delete-user" element={
                <AdminRoute>
                  <DeleteUser />
              </AdminRoute>
              }/>
          </Routes>

            <Footer />

  
    </Router>
    
  );
}

export default App;
