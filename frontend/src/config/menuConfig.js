export const menuConfig = {


    SUPER_ADMIN:[
        {
            name:"Organizations",
            path:"/organization"
        },
        {
            name:"Users",
            path:"/users"
        },
        {
            name:"Projects",
            path:"/projects"
        },
        {
            name:"Profile",
            path:"/profile"
        }
    ],



    ADMIN:[

        {
            name:"Organization",
            path:"/organization/organization"
        },

        {
            name:"Users",
            path:"/organization/users"
        },

        {
            name:"Projects",
            path:"/organization/projects"
        },

        {
            name:"Profile",
            path:"/organization/profile"
        }

    ],



    LEAD:[

        {
            name:"Projects",
            path:"/organization/projects"
        },

        {
            name:"Tasks",
            path:"/organization/tasks"
        },

        {
            name:"Profile",
            path:"/organization/profile"
        }

    ],



    MEMBER:[

        {
            name:"My Tasks",
            path:"/organization/tasks"
        },

        {
            name:"Profile",
            path:"/organization/profile"
        }

    ]

};