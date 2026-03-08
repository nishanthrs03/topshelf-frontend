import {useEffect, useState} from 'react';
import {useNavigate,Link} from 'react-router-dom'
import api from '../services/api';
import "../styles/EditProfile.css"

const EditProfile=()=>{

    const[username,setUsername]=useState('')

    const[bio,setBio]=useState('')

    const[loading,setLoading]=useState(true)



    const navigate=useNavigate();

     useEffect(()=>{
        const fetchAccount=async()=>{
            try{
                const response= await api.get('/api/v1/account');
                setUsername(response.data.username)
                setBio(response.data.bio)
                setLoading(false)
            }catch(err){
                console.log("Error in fectching account details");
            }finally{
                setLoading(false)
            }
        }
        fetchAccount()
    },[])            

    const handleSubmit=async(e)=>{
        e.preventDefault()
        try{
            const response= await api.put('/api/v1/account',{username,bio});
            navigate('/myaccount');
        }catch(err){
            console.log("Error edit user details",bio);
        }finally{
            setLoading(false)
        }
    };
    if(loading){
        return <p>Loading</p>
    }
    return(
        <div className='edit-profile-wrapper'>
            <div className='edit-profile-card'>
            <h2>Edit Profile</h2>
                <form onSubmit={handleSubmit} className='edit-form'>
                    <div className='edit-input-group'>
                        <label>New Username</label>
                        <input type="text" value={username} onChange={e=>setUsername(e.target.value)}/>
                    </div>
                    <div className='edit-input-group'>
                        <label>Update Bio</label>
                        <textarea value={bio} onChange={e=>setBio(e.target.value)}/>
                    </div>
                    <button type="submit" className='save-changes-btn'>
                        Submit Changes
                    </button>
                    <Link to="/myaccount" className='cancel-link'>
                        Cancel and Go Back
                    </Link>
                </form>
            </div>
        </div>
    )
}

export default EditProfile;