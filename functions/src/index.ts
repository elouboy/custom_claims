import * as admin from "firebase-admin";
import * as functions from "firebase-functions"; 


admin.initializeApp();

exports.setAdmin =  functions.https.onCall((data, context) =>{
    return admin.auth().getUserByEmail(data.email).then(user => {
        return admin.auth().setCustomUserClaims(user.uid, {
            admin: true
        });
    }).then(() => {
        return {
            message: `${data.email} est un admin`
        }
    }).catch(error => {
        return error 
    });
})


exports.addAdmin = functions.https.onCall((data, context) => {
    if(context.auth?.token.admin !== true){
        return{
            error: "Requête non authoriser, seuls les admins sont authorisés à faire cette requête"
        };
    }
    const email = data.email;
    return grantAdminrole(email).then(()=> {
        return{
            result: `${email} est un admin`
        }
    })
})

exports.deleteAdmin = functions.https.onCall((data, context)=> {
    if(context.auth?.token.admin !== true){
        return{
            error: "Requête non authoriser, seuls les admins sont authorisés à faire cette requête"
        };
    }
    const email = data.email;
    return deleteAccess(email).then(() =>{
        return{
            result: `${email} n'est plus un admin`
        }
    })
})

async function grantAdminrole(email: string): Promise<void>{
    const user = await admin.auth().getUserByEmail(email);
    if(user.customClaims && (user.customClaims as any).admin === true){
        return;
    }
    return admin.auth().setCustomUserClaims(user.uid, {
        admin: true
    });
}

async function deleteAccess(email: string): Promise<void>{
    const user = await admin.auth().getUserByEmail(email);
    if(user.customClaims && (user.customClaims as any).admin === true){
        return admin.auth().setCustomUserClaims(user.uid, {
           admin: false, 
        })
    }
    return;
}