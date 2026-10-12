export const sent=[];
export function clearSent(){sent.length=0;}
export default {
  generateVAPIDKeys(){return {publicKey:'mock-public-key',privateKey:'mock-private-key'};},
  async sendNotification(subscription,payload,options){sent.push({subscription,payload:JSON.parse(payload),options});return {statusCode:201};}
};
