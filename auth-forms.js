import {$,busy,message,fieldError,clearErrors,focusError,safeNext} from './ui.js';
import {getServices,friendlyError,withTimeout} from './data.js';
const form=$('loginForm')||$('registerForm'),register=!!$('registerForm');
const next=safeNext();
for(const id of ['loginLink','registerLink'])if($(id)&&next!=='index.html')$(id).href+=`?next=${encodeURIComponent(next)}`;
function validate(){
  clearErrors(form);let valid=true;
  const fail=(id,text)=>{fieldError(id,text);valid=false;};
  if(!$('email').value.trim()||!$('email').validity.valid)fail('email','Please enter a valid email address.');
  if(!$('password').value)fail('password','Please enter your password.');
  if(register){
    if(!$('name').value.trim())fail('name','Please enter your full name.');
    if(!$('dept').value.trim())fail('dept','Please enter your department.');
    if(!$('sid').value.trim())fail('sid','Please enter your student ID.');
    if($('password').value.length<6)fail('password','Use at least 6 characters.');
    if(!$('confirmPassword').value||$('password').value!==$('confirmPassword').value)fail('confirmPassword','The passwords must match.');
  }
  if(!valid)focusError(form);return valid;
}
form.addEventListener('input',event=>{if(event.target.id)fieldError(event.target.id);});
let submitting=false;
form.addEventListener('submit',async event=>{
  event.preventDefault();if(submitting||!validate())return;
  if(!navigator.onLine){message('You’re offline. Reconnect and try again.');return;}
  submitting=true;const button=form.querySelector('[type=submit]');busy(button,true,register?'Creating your account…':'Signing in…');
  let createdUser=null;
  try{
    const s=await getServices(),email=$('email').value.trim(),password=$('password').value;
    if(register){
      const credential=await s.authApi.createUserWithEmailAndPassword(s.auth,email,password);createdUser=credential.user;
      await s.authApi.updateProfile(createdUser,{displayName:$('name').value.trim()});
      // Optional profile metadata; never include passwords in Firestore.
      await withTimeout(s.storeApi.setDoc(s.storeApi.doc(s.db,'users',createdUser.uid),{
        displayName:$('name').value.trim(),department:$('dept').value.trim(),studentId:$('sid').value.trim(),email,createdAt:s.storeApi.serverTimestamp()
      },{merge:true}));
    }else await s.authApi.signInWithEmailAndPassword(s.auth,email,password);
    message(register?'Your account is ready. Opening your campus space…':'Signed in. Opening your campus space…',true);
    location.assign(next);
  }catch(error){
    if(createdUser){
      // Account creation has already succeeded. Do not invite a duplicate signup.
      message('Your account was created, but some profile details could not be saved. You can still continue to ARMS.',true);
      const link=document.createElement('a');link.className='btn btn-primary btn-full';link.href=next;link.textContent='Continue to ARMS';button.replaceWith(link);
      form.querySelectorAll('input').forEach(input=>input.disabled=true);
    }else message(friendlyError(error,register?'We couldn’t create your account. Please try again.':'We couldn’t sign you in. Please try again.'));
  }finally{submitting=false;if(button.isConnected)busy(button,false);}
});
