// One Firebase configuration, lazy loading and bounded waits for read operations.
let servicesPromise;
export function withTimeout(promise,ms=15000) {
  let timer;
  return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('connection-timeout')),ms);})]).finally(()=>clearTimeout(timer));
}
export function getServices() {
  if(!servicesPromise){
    servicesPromise=withTimeout(Promise.all([
      import('./firebase.js'),
      import('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js'),
      import('https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js')
    ]),12000).then(([core,authApi,storeApi,storageApi])=>({...core,authApi,storeApi,storageApi})).catch(error=>{servicesPromise=null;throw error;});
  }
  return servicesPromise;
}
export async function getCurrentUser() {
  const s=await getServices();
  return new Promise((resolve,reject)=>{
    let unsub=()=>{};const timer=setTimeout(()=>{unsub();reject(new Error('connection-timeout'));},12000);
    unsub=s.authApi.onAuthStateChanged(s.auth,user=>{clearTimeout(timer);unsub();resolve(user);},error=>{clearTimeout(timer);unsub();reject(error);});
  });
}
export function newestFirst(a,b){const seconds=ad=>Number(ad.timestamp?.seconds)||0;return seconds(b)-seconds(a);}
export async function readAds(ownerId) {
  const {db,storeApi:f}=await getServices();
  const base=f.collection(db,'ads');
  const request=ownerId?f.query(base,f.where('userId','==',ownerId)):f.query(base);
  const snapshot=await withTimeout(f.getDocs(request));
  const ads=[];snapshot.forEach(item=>{const data=item.data();if(!data.status||data.status==='active')ads.push({...data,id:item.id});});
  return ads.sort(newestFirst);
}
export function friendlyError(error,fallback='Something went wrong. Please try again.') {
  const map={
    'auth/invalid-email':'Enter a valid email address.',
    'auth/invalid-credential':'The email or password is incorrect. Please try again.',
    'auth/invalid-login-credentials':'The email or password is incorrect. Please try again.',
    'auth/wrong-password':'The email or password is incorrect. Please try again.',
    'auth/user-not-found':'The email or password is incorrect. Please try again.',
    'auth/email-already-in-use':'This email already has an account. Please sign in.',
    'auth/weak-password':'Choose a password with at least 6 characters.',
    'auth/too-many-requests':'Too many attempts. Wait a moment before trying again.',
    'auth/network-request-failed':'We couldn’t connect. Check your internet connection and try again.',
    'auth/user-disabled':'This account is disabled. Contact the site administrator.',
    'permission-denied':'This action is not available for your account. Please contact the site administrator.',
    'storage/unauthorized':'The photo could not be uploaded. Please contact the site administrator.',
    'storage/canceled':'Photo upload was cancelled. You can try again.',
    'unavailable':'Resources are temporarily unavailable. Please try again shortly.'
  };
  if(!navigator.onLine||error?.message==='connection-timeout'||error instanceof TypeError)return 'We couldn’t connect. Check your internet connection, then try again.';
  return map[error?.code]||fallback;
}
