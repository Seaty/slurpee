/*=========================================================================================
  File Name: sidebarItems.js
  Description: Sidebar Items list. Add / Remove menu items from here.
  Strucutre:
          url     => router path
          name    => name to display in sidebar
          slug    => router path name
          icon    => Feather Icon component/icon name
          tag     => text to display on badge
          tagColor  => class to apply on badge element
          i18n    => Internationalization
          submenu   => submenu of current item (current item will become dropdown )
                NOTE: Submenu don't have any icon(you can add icon if u want to display)
          isDisabled  => disable sidebar item/group
  ----------------------------------------------------------------------------------------
  Item Name: Vuesax Admin - VueJS Dashboard Admin Template
  Author: Pixinvent
  Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/


export default [
  {
    url: "/",
    name: "dashboard",
    slug: "dashboard",
    icon: "HomeIcon",
    acl: 'isPublic'
  },
  {
    url: "/eqStatus",
    name: "equipment_status",
    slug: "equipment_status",
    icon: "AirplayIcon",
    acl: 'isPublic'
  },
  {
    url: "/eqRegis",
    name: "equipment_register",
    slug: "equipment register",
    icon: "HardDriveIcon",
    acl: 'isPublic'
  },
  {
    url: "/eqGrouping",
    name: "equipment_grouping",
    slug: "equipment Grouping",
    icon: "HardDriveIcon",
    acl: 'isPublic'
  },
  {
    url: "/uploadVideo",
    name: "upload_video_menu",
    slug: "upload_video_menu",
    icon: "VideoIcon",
    acl: 'isPublic'
  },
  {
    url: "/userManage",
    name: "user_manage",
    slug: "user_manage",
    icon: "UserIcon",
    acl: 'isAdmin'
  },
]
