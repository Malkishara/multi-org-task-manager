import React, { useState , useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';


import Button from '../../components/button/Button';
import TextField from '../../components/text-field/TextField';

import { authApi } from '../../apis/auth_api';
import { userApi} from '../../apis/user_api';
import { 
    loginSuccess,
    setUser
} from '../../redux/slices/authSlice';
import routes from '../../config/routes';
import authImage from '../../assests/images/auth_ui_image.jpg';

import styles from './AuthPage.module.scss';



export default function AuthPage({ mode }) {


  const isSignup = mode === 'signup';


  const navigate = useNavigate();
  const dispatch = useDispatch();



  const [form,setForm] = useState({

    firstName:'',
    lastName:'',
    email:'',
    password:'',

  });


useEffect(() => {

    toast.success("Toast is working");

}, []);

  const [loading,setLoading] = useState(false);



  const handleChange=(event)=>{

    setForm(prev=>({

      ...prev,

      [event.target.name]:
          event.target.value,

    }));

  };




  const handleSubmit = async(event)=>{

    event.preventDefault();

    setLoading(true);


    try {


      const payload = {

        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,

      };



      const response =
        isSignup
        ?
        await authApi.signup(payload)
        :
        await authApi.login(payload);
dispatch(
    loginSuccess({
        user:null,
        token:response.token,
    })
);


// Get logged user profile

const profile = await userApi.getCurrentUser();


dispatch(
    setUser(profile)
);



      toast.success(

        isSignup
        ?
        'Account created successfully'
        :
        'Login successful'

      );



      navigate(routes.organization.path);



    }catch(error){


      toast.error(

        error.message ||
        'Authentication failed'

      );


    }
    finally{

      setLoading(false);

    }

  };





  const handleSwitch=()=>{

    navigate(
      isSignup
      ?
      routes.login.path
      :
      routes.signup.path
    );

  };




return (

<div className={styles.container}>


<div className={styles.leftSide}>


<div className={styles.formContainer}>


<h2 className={styles.title}>

{
isSignup
?
'Create your account'
:
'Welcome back'
}

</h2>



<p className={styles.subtitle}>

{
isSignup
?
'Start coordinating multi-organization work in one place.'
:
'Sign in to continue managing your teams.'
}

</p>




<form
onSubmit={handleSubmit}
className={styles.form}
>



{
isSignup &&

<>

<TextField

label="First Name"

name="firstName"

value={form.firstName}

onChange={handleChange}

required

/>


<TextField

label="Last Name"

name="lastName"

value={form.lastName}

onChange={handleChange}

required

/>

</>

}




<TextField

label="Email"

name="email"

type="email"

value={form.email}

onChange={handleChange}

required

/>



<TextField

label="Password"

name="password"

type="password"

value={form.password}

onChange={handleChange}

required

/>



<Button

type="submit"

variant="primary"

disabled={loading}

>

{

loading

?

'Please wait...'

:

isSignup

?

'Sign Up'

:

'Sign In'

}

</Button>




<p className={styles.switchText}>

{
isSignup
?
'Already have an account?'
:
'Need an account?'
}

{' '}


<button

type="button"

onClick={handleSwitch}

className={styles.switchButton}

>

{
isSignup
?
'Sign In'
:
'Sign Up'
}

</button>


</p>



</form>


</div>


</div>




<div className={styles.rightSide}>

<div className={styles.imageCard}>

<img

src={authImage}

alt="Authentication"

className={styles.image}

/>

</div>

</div>


</div>

);

}