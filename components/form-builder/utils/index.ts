export { handleDelete } from "./handleDelete";
export const isVaultDelivery(deliveryOption){
  if(deliveryOption.emailAddress){
    return false;
  }
  return true
}

export const isEmailDelivery(deliveryOption){
  if(deliveryOption.emailAddress){
    return false;
  }
  return true
}