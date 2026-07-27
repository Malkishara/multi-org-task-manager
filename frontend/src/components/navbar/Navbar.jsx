import React,{useState} from "react";
import {
    FiMenu,
    FiBell,
    FiChevronDown,
    FiLogOut
} from "react-icons/fi";

import {
    NavLink
} from "react-router-dom";


import {
    menuConfig
} from "../../config/menuConfig";


import styles from "./Navbar.module.scss";


export default function Navbar({
    user,
    onLogout,
    onMenuClick
}) {


const [open,setOpen]=useState(false);



// No default here - a logged-out visitor has no role, so menus below
// resolves to [] instead of showing protected links they'd just get
// bounced from.
const role =
user?.role;


const menus =
menuConfig[role] || [];



const fullName =
`${user?.firstName || ""}
 ${user?.lastName || ""}`;



return (

<header className={styles.navbar}>


<button
className={styles.menuButton}
onClick={onMenuClick}
>

<FiMenu/>

</button>



<div className={styles.brand}>
TaskFlow
</div>



<nav className={styles.menu}>


{
menus.map(item=>(

<NavLink

key={item.path}

to={item.path}

className={({isActive})=>

isActive
?
styles.active
:
styles.link

}

>

{item.name}

</NavLink>

))

}


</nav>




<div className={styles.actions}>



{
user
?

<div className={styles.profileWrapper}>


<button

className={styles.profile}

onClick={()=>setOpen(!open)}

>


<div className={styles.avatar}>

{
fullName
.trim()
.charAt(0)
.toUpperCase()
}

</div>



<div className={styles.userInfo}>

<span>
{fullName}
</span>

<small>
{role}
</small>

</div>



<FiChevronDown/>


</button>




{
open &&

<div className={styles.dropdown}>


<strong>
{fullName}
</strong>


<span>
{user?.email}
</span>


<button
className={styles.logout}
onClick={onLogout}
>

<FiLogOut/>

Logout

</button>


</div>

}



</div>

:

<div className={styles.authLinks}>

<NavLink to="/auth/login" className={styles.link}>
Login
</NavLink>

<NavLink to="/auth/signup" className={styles.link}>
Sign up
</NavLink>

</div>

}


</div>



</header>

);

}