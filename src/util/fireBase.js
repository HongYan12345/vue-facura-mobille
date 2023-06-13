import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword,  createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { message } from 'ant-design-vue';


export async function loginUser(email, password){
  const auth = getAuth();
  return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log("success", user)
      message.success("success")
      return user
  })
  .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("[error]", errorCode, errorMessage)
      throw error;
  });
}

export async function googleLogin(){
    const provider = new GoogleAuthProvider();
      const auth = getAuth();
      try {
        const result = await signInWithPopup(auth, provider);
        // The signed-in user info.
        const user = result.user;
        console.log(user);
      } catch (e) {
        // Handle Errors here.
        console.log(e.message);
      }
}

export async function registraLogin(email, password){
  const auth = getAuth();
  return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
          // Signed in
          const user = userCredential.user;

          // Send email verification
          return sendEmailVerification(user).then(() => {
              console.log("Verification email sent.");
              message.success("success, verification email has been sent");
              return user;
          })
          .catch((error) => {
              // Handle email verification error
              console.error("Error sending verification email: ", error);
              throw error;
          });
      })
      .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("[error]", errorCode, errorMessage)
          throw error;
      });
}
export async function logOut(){
  const auth = getAuth();
  try {
    await signOut(auth);
    console.log('User signed out!');
  } catch (error) {
    console.error('Error signing out: ', error);
  }
}

export async function olvidaPass(emailAddress){
  const auth = getAuth();
  message.loading("wait")
  sendPasswordResetEmail(auth, emailAddress)
  .then(() => {
    // Password reset email sent!
    message.success("password reset email sent")
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    message.error("error")
  });
}