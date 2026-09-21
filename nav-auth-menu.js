import {$,busy,toast,skeletons,state,renderAds,confirmAction,icon} from './ui.js';
import {getServices,readAds,friendlyError} from './data.js';
let currentUser=null,services=null,profileRequest=0,watching=false;
function showUser(user){
  currentUser=user;
  const name=user?.displayName||user?.email?.split('@')[0]||'Welcome to ARMS';
  $('menuName').textContent=name;$('menuEmail').textContent=user?.email||'Learn more. Share more.';
  $('dlgName').textContent=name;$('dlgEmail').textContent=user?.email||'';
  for(const id of ['menuAvatar','dlgAvatar']){if(user)$(id).textContent=name.charAt(0);else $(id).replaceChildren(icon('user'));}
  $('menuProfile').hidden=!user;$('menuLogout').hidden=!user;$('menuLogin').hidden=!!user;$('menuRegister').hidden=!!user;
  $('headerLogin').hidden=!!user;
  if(!user){profileRequest++;$('profileDialog').close();$('userAdsContainer').replaceChildren();}
}
async function connect(){
  if(watching)return;
  try{services=await getServices();if(watching)return;watching=true;services.authApi.onAuthStateChanged(services.auth,showUser,()=>{watching=false;});}catch{ /* Guest links and menu remain usable. A retry occurs when the menu is opened. */ }
}
connect();$('kebabBtn')?.addEventListener('click',connect);window.addEventListener('online',connect);
$('menuProfile')?.addEventListener('click',()=>{if(!currentUser)return;$('slideMenu').close();$('profileDialog').showModal();loadUserAds();});
async function loadUserAds(){
  const user=currentUser;if(!user)return;
  const request=++profileRequest,container=$('userAdsContainer');$('adsCount').textContent='—';skeletons(container,2);
  try{const ads=await readAds(user.uid);if(request!==profileRequest||currentUser?.uid!==user.uid)return;
    $('adsCount').textContent=ads.length;
    if(!ads.length){state(container,{title:'Your next chapter starts here.',description:'You haven’t posted any resources yet. Share something useful with your campus.',href:'post-ad.html',label:'Post your first ad'});return;}
    renderAds(container,ads,{onDelete:async(ad,button)=>{
      if(!await confirmAction('Delete this ad?','This resource will be removed from ARMS. This action cannot be undone.'))return;
      busy(button,true,'');
      try{if(currentUser?.uid!==ad.userId)throw new Error('owner-changed');await services.storeApi.deleteDoc(services.storeApi.doc(services.db,'ads',ad.id));toast('Your ad has been deleted.');await loadUserAds();}
      catch(error){busy(button,false);toast(friendlyError(error,'Couldn’t delete this ad. Please try again.'),true);}
    }});
  }catch(error){if(request!==profileRequest)return;$('adsCount').textContent='—';state(container,{title:'Your ads couldn’t load.',description:friendlyError(error,'Please try loading your ads again.'),type:'error',action:loadUserAds});}
}
$('menuLogout')?.addEventListener('click',async()=>{
  const button=$('menuLogout');busy(button,true,'Signing out…');
  try{await services.authApi.signOut(services.auth);$('slideMenu').close();toast('You’ve signed out.');}catch(error){toast(friendlyError(error,'Couldn’t sign out. Please try again.'),true);}finally{busy(button,false);}
});
