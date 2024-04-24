import moment from "moment";
import { addDocumentFirebase, getCollectionFirebaseV2, updateDocumentFirebase } from "./firebaseApi";
import { auth } from "../configs/firebase";
import { Platform } from "react-native";

const createHrisFirebase = async (globalState, collection, data) => {
    try {
      const today = moment().startOf('day'); // Start of today
      const companyId = globalState?.currentCompany;
      const projectId = globalState?.currentProject;
      const officeId = data?.office_uid;
  
      const conditions = [
        { field: 'companyId', operator: '==', value: companyId },
        { field: 'projectId', operator: '==', value: projectId },
        { field: 'officeId', operator: '==', value: officeId },
        { field: 'userId', operator: '==', value: auth.currentUser.uid },
        { field: 'period', operator: '>=', value: moment(today.toDate()).unix() },
      ];

  
      const sortBy = { field: 'period', direction: 'desc' };
      const limitValue = 1;
  
      const res = await getCollectionFirebaseV2(collection, conditions, sortBy, limitValue);
      if (res?.length > 0) {
        const dataUpdate = {
          clock_out: moment().unix(),
          image_out: data?.image || null,
          latitude_out: data?.latitude || null,
          longitude_out: data?.longitude || null, 
          gmt_out: moment().utcOffset() / 60,
          attendanceStatus: 'fulltime'
        };
        await updateDocumentFirebase(collection, res[0].id, dataUpdate);
        // console.log('clock in to firebase success');
      } else {
        const dataSend = {
          officeId: data?.office_uid,
          companyId: companyId,
          projectId: projectId,
          userId: auth?.currentUser?.uid || '',
          period: moment().unix(),
          clock_in: moment().unix(),
          image_in: data?.image || null,
          latitude_in: data?.latitude || null,
          longitude_in: data?.longitude || null,
          clock_out: null,
          image_out: null,
          latitude_out: null,
          longitude_out: null,
          gmt_in: moment().utcOffset() / 60,
          module: 'hris',
          attendanceStatus: 'halftime',
          userAgent : 'mobile_app',
          operatingSystem :  Platform?.OS || '',
        };
        await addDocumentFirebase(collection, dataSend, companyId);
        // console.log('clock out to firebase success');
      }
    } catch (error) {
      throw new Error(error.message, 'Failed to send  error message');
    }
  };


  export { createHrisFirebase }