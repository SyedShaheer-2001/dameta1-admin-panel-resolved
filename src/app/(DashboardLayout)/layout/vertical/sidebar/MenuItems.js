import { uniqueId } from 'lodash';

import {
  IconAperture,
  IconCategory ,
  IconNotes 

} from '@tabler/icons-react';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
  },

  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconAperture,
    href: '/',
  },
  {
    id: uniqueId(),
    title: 'Categories',
    icon: IconCategory,
    href: '/categories',
  },
  {
    id: uniqueId(),
    title: 'Blogs',
    icon: IconNotes ,
    href: '/blogs',
  },
  
  // Menu items sidebar items

];

export default Menuitems;
