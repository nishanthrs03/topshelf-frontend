import { createContext,useContext,useState ,useEffect} from "react";
import api from '../services/api';

const AuthContext=createContext();

export const AuthProvider=({children})=>{
    const[user,setUser]=useState(null);
    const[loading,setLoading]=useState(true);

    const checkUser=async()=>{
        try{
            const res=await api.get('/api/v1/account');
            setUser(res.data);
        }catch(err){
            setUser(null);
        }finally{
            setLoading(false);
        }
    };

    useEffect(()=>{
        checkUser();
    },[]);
    return(
        <AuthContext.Provider value={{user,setUser,loading,checkUser}}>
            {children}
        </AuthContext.Provider>
    );
    
};
export const useAuth=()=>useContext(AuthContext);
