import {$,busy,message,fieldError,clearErrors,focusError,el,icon} from './ui.js';
import {getServices,getCurrentUser,friendlyError} from './data.js';
const form=$('adForm'),fields=$('adFields'),submit=$('submitBtn'),status=$('sessionStatus');
let user=null,services=null,selectedFile=null,previewURL='',invalidImage=false,submitting=false,sessionLoading=false;
let pendingDoc=null,uploadedImage=null,authWatching=false;
function counters(){ $('titleCount').textContent=`${$('title').value.length}/80`; }
form.addEventListener('input',event=>{counters();if(event.target.id&&event.target.id!=='image')fieldError(event.target.id);});
function removePhoto(){
  if(previewURL)URL.revokeObjectURL(previewURL);previewURL='';selectedFile=null;uploadedImage=null;invalidImage=false;
  $('clearImageError').hidden=true;$('image').value='';$('previewImg').removeAttribute('src');$('preview').hidden=true;$('dropZone').hidden=false;fieldError('image');
}
function choosePhoto(file){
  if(!file)return;removePhoto();
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){invalidImage=true;$('clearImageError').hidden=false;fieldError('image','Choose a JPG, PNG or WebP image.');return;}
  if(file.size>3*1024*1024){invalidImage=true;$('clearImageError').hidden=false;fieldError('image','This photo is too large. Choose one under 3 MB.');return;}
  if(!file.size){invalidImage=true;$('clearImageError').hidden=false;fieldError('image','This image is empty. Choose another file.');return;}
  selectedFile=file;previewURL=URL.createObjectURL(file);$('previewImg').src=previewURL;
  $('previewName').textContent=file.name;$('previewSize').textContent=`${(file.size/1024).toFixed(0)} KB`;
  $('preview').hidden=false;$('dropZone').hidden=true;
}
$('image').addEventListener('change',event=>choosePhoto(event.target.files[0]));
$('previewImg').addEventListener('error',()=>{if(!selectedFile)return;removePhoto();invalidImage=true;$('clearImageError').hidden=false;fieldError('image','This file cannot be opened as an image. Choose another photo.');});
$('removeImage').addEventListener('click',removePhoto);$('clearImageError').addEventListener('click',removePhoto);
for(const name of ['dragenter','dragover'])$('dropZone').addEventListener(name,event=>{event.preventDefault();if(!fields.disabled)$('dropZone').classList.add('dragging');});
for(const name of ['dragleave','drop'])$('dropZone').addEventListener(name,event=>{event.preventDefault();$('dropZone').classList.remove('dragging');});
$('dropZone').addEventListener('drop',event=>{if(!fields.disabled)choosePhoto(event.dataTransfer.files[0]);});
window.addEventListener('pagehide',()=>{if(previewURL)URL.revokeObjectURL(previewURL);});
async function checkSession(){
  if(sessionLoading)return;sessionLoading=true;fields.disabled=true;status.hidden=false;status.replaceChildren(el('span','spinner'),document.createTextNode('Checking your session…'));
  try{
    services=await getServices();user=await getCurrentUser();
    if(!user){location.replace('login.html?next=post-ad.html');return;}
    status.hidden=true;fields.disabled=false;
    if(!authWatching){authWatching=true;services.authApi.onAuthStateChanged(services.auth,next=>{user=next;if(!next){fields.disabled=true;location.replace('login.html?next=post-ad.html');}});}
  }catch(error){
    status.replaceChildren(icon('info'),el('span','',friendlyError(error,'We couldn’t check your session. Please try again.')));
    const retry=el('button','btn btn-outline','Try again');retry.type='button';retry.addEventListener('click',checkSession);status.append(retry);
  }finally{sessionLoading=false;}
}
checkSession();window.addEventListener('online',()=>{if(!user)checkSession();});
function validate(){
  const priorImageError=$('err-image').textContent;clearErrors(form);let valid=true;
  const fail=(id,text)=>{fieldError(id,text);valid=false;};
  const title=$('title').value.trim(),price=Number($('price').value);
  if(!title||title.length>80)fail('title','Enter a title of 1–80 characters.');
  if(!$('category').value)fail('category','Please choose a category.');
  if($('price').value===''||!Number.isFinite(price)||price<0||!Number.isInteger(price))fail('price','Enter a whole-number price of 0 or more.');
  if(invalidImage)fail('image',priorImageError||'Choose a valid image before publishing.');
  if(!$('agree').checked)fail('agree','Please confirm that you have the right to share this resource.');
  if(!valid)focusError(form);return valid;
}
async function uploadPhoto(){
  if(!selectedFile)return '';
  if(uploadedImage?.file===selectedFile)return uploadedImage.url;
  const file=selectedFile,s=services.storageApi;
  const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-90);
  const uploadRef=s.ref(services.storage,`ads/${Date.now()}_${crypto.randomUUID().slice(0,8)}_${safeName}`);
  const task=s.uploadBytesResumable(uploadRef,file,{contentType:file.type});
  $('uploadProgress').hidden=false;busy(submit,true,'Uploading photo…');
  await new Promise((resolve,reject)=>task.on('state_changed',snapshot=>{
    const percent=Math.round((snapshot.bytesTransferred/snapshot.totalBytes)*100);
    $('uploadPercent').textContent=`${percent}%`;$('uploadBar').value=percent;$('uploadBar').textContent=`${percent}%`;
  },reject,resolve));
  const url=await s.getDownloadURL(uploadRef);uploadedImage={file,url};return url;
}
form.addEventListener('submit',async event=>{
  event.preventDefault();if(submitting||!validate())return;
  if(!user){message('Please sign in before posting a resource.');return;}
  if(!navigator.onLine){message('You’re offline. Reconnect before publishing your resource.');return;}
  submitting=true;fields.disabled=true;busy(submit,true,'Preparing your listing…');
  try{
    const image=await uploadPhoto();busy(submit,true,'Publishing your ad…');
    const f=services.storeApi;
    // Reuse the same document ID after an uncertain network result to avoid duplicates.
    pendingDoc??=f.doc(f.collection(services.db,'ads'));
    await f.setDoc(pendingDoc,{
      title:$('title').value.trim(),category:$('category').value,description:$('description').value.trim(),price:Number($('price').value),
      userId:user.uid,email:user.email||'',displayName:user.displayName||user.email?.split('@')[0]||'Student',timestamp:f.serverTimestamp(),status:'active',image
    });
    form.hidden=true;$('confirmation').hidden=false;$('confirmation').focus();
    form.reset();removePhoto();counters();pendingDoc=null;
  }catch(error){message(friendlyError(error,'Your ad could not be published. Your details are still here; please try again.'));}
  finally{submitting=false;fields.disabled=!user;busy(submit,false);$('uploadProgress').hidden=true;}
});
$('postAnother').addEventListener('click',()=>{$('confirmation').hidden=true;form.hidden=false;message('');$('title').focus();});
counters();
