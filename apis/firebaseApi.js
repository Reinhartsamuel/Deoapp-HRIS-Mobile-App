import { signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth"
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc, startAfter, updateDoc, where } from "firebase/firestore";
import { auth, db, storage } from "../configs/firebase";



export const getSingleDocumentFirebase = async (collectionName, docName) => {
	try {
		const docRef = doc(db, collectionName, docName);
		const docSnapshot = await getDoc(docRef);

		if (docSnapshot.exists) {
			const docData = docSnapshot?.data();
			docData.id = docSnapshot?.id
			// Lakukan manipulasi data atau operasi lain jika diperlukan
			return docData;
		} else {
			console.log("Dokumen tidak ditemukan!");
			return null;
		}
	} catch (error) {
		console.log("Terjadi kesalahan getSingleDocumentFirebase:", error);
		return error;
	}
};

export const getCollectionWhereFirebase = async (collectionName, whereKey, operator, whereValue) => {
	const ref = collection(db, collectionName);
	const q = query(ref, where(whereKey, operator, whereValue));
	const querySnapshot = await getDocs(q);
	const data = []
	querySnapshot.forEach((doc) => {
		const obj = { id: doc.id, ...doc.data() }
		data.push(obj)
	});
	return data
}

export const getCollectionFirebase = async (
	collectionName,
	{ conditions = [] },
	{ sortBy = null },
	{ limitValue = null },
	{ startAfterData = null }
) => {
	try {
		let collectionRef = collection(db, collectionName);

		// Tambahkan kondisi filter jika ada
		if (conditions.length > 0) {
			conditions.forEach((condition) => {
				const { field, operator, value } = condition;
				collectionRef = query(collectionRef, where(field, operator, value));
			});
		}

		// Tambahkan pengurutan jika ada
		if (sortBy) {
			const { field, direction } = sortBy;
			collectionRef = query(collectionRef, orderBy(field, direction));
		}

		// Tambahkan batasan jumlah dokumen jika ada
		if (limitValue) {
			collectionRef = query(collectionRef, limit(limitValue));
		}

		if (startAfterData) {
			// console.log(startAfterData)
			collectionRef = query(collectionRef, startAfter(startAfterData));
		}

		const querySnapshot = await getDocs(collectionRef);
		const collectionData = [];
		querySnapshot.forEach((doc) => {
			const docData = doc.data();
			// Lakukan manipulasi data atau operasi lain jika diperlukan
			collectionData.push({ id: doc.id, ...docData });
		});
		//   console.log(collectionData,'ini data di collectiondata')
		return collectionData; // Outputkan data koleksi ke konsol (bisa diganti sesuai kebutuhan)
	} catch (error) {
		console.log("Terjadi kesalahan getCollectionFirebase:", error);
	}
};

// export const getCollectionNewestttttt = async (
// 	collectionName,
// 	{ conditions },
// 	{ sortBy },
// 	{ limitValue },
// 	{ startAfterData }
// ) => {
// 	try {
// 		let collectionRef = collection(db, collectionName);

// 		// Apply filtering conditions
// 		conditions.forEach((condition) => {
// 			const { field, operator, value } = condition;
// 			collectionRef = query(collectionRef, where(field, operator, value));
// 		});

// 		// Apply sorting
// 		if (sortBy) {
// 			const { field, direction } = sortBy;
// 			collectionRef = query(collectionRef, orderBy(field, direction));
// 		}

// 		// Apply limit if specified
// 		if (limitValue) {
// 			collectionRef = query(collectionRef, limit(limitValue));
// 		}

// 		// Apply startAfter if specified
// 		if (startAfterData) {
// 			collectionRef = query(collectionRef, startAfter(startAfterData));
// 		}

// 		const querySnapshot = await getDocs(collectionRef);
// 		const collectionData = [];

// 		querySnapshot.forEach((doc) => {
// 			const docData = doc.data();
// 			collectionData.push({ id: doc.id, ...docData });
// 		});

// 		return collectionData;
// 	} catch (error) {
// 		console.log("An error occurred:", error);
// 		throw error; // Rethrow the error for handling in the calling code
// 	}
// };


export const getCollectionFirebaseV2 = async (
	collectionName,
	conditions = [],
	sortBy,
	limitValue = null,
	startAfterData = null
) => {
	try {
		let collectionRef = collection(db, collectionName);

		// Tambahkan kondisi filter jika ada
		if (conditions.length > 0) {
			conditions.forEach((condition) => {
				const { field, operator, value } = condition;
				collectionRef = query(collectionRef, where(field, operator, value));
			});
		}

		// Tambahkan pengurutan jika ada
		if (sortBy) {
			const { field, direction } = sortBy;
			collectionRef = query(collectionRef, orderBy(field, direction));
		}

		// Tambahkan batasan jumlah dokumen jika ada
		if (limitValue) {
			collectionRef = query(collectionRef, limit(limitValue));
		}

		if (startAfterData) {
			// console.log(startAfterData)
			// collectionRef = query(collectionRef, startAfter(startAfterData));
		}

		const querySnapshot = await getDocs(collectionRef);
		const collectionData = [];
		querySnapshot.forEach((doc) => {
			const docData = doc.data();
			// Lakukan manipulasi data atau operasi lain jika diperlukan
			collectionData.push({ id: doc.id, ...docData });
		});
		return collectionData; // Outputkan data koleksi ke konsol (bisa diganti sesuai kebutuhan)
	} catch (error) {
		// console.log("Terjadi kesalahan:", error);
		throw new Error(error.message)
	}
};

export const getCollectionNextFirebase = async (collectionName, docName) => {

	return (
		<></>
	)
}

export const setDocumentFirebase = async (collectionName, docName, data, projectsId) => {
	data.lastUpdated = new Date()
	data.lastUpdatedBy = { uid: auth?.currentUser?.uid || "", email: auth?.currentUser?.email || "" }
	data.projectsId = projectsId

	const cityRef = doc(db, collectionName, docName);
	await setDoc(cityRef, data, { merge: true });
	//returns toast
	return (
		<></>
	)
}
export const addDocumentFirebase = async (collectionName, data, companyId) => {
	if (!companyId) return "No Company ID";

	try {
		data.createdAt = new Date();
		if (auth.currentUser) data.createdBy = auth.currentUser.uid;
		data.companyId = companyId;

		const docRef = await addDoc(collection(db, collectionName), data);

		// Kembalikan ID dokumen yang baru dibuat
		return docRef.id;
	} catch (error) {
		// console.log("Terjadi kesalahan:", error);
		// throw error;
		throw new Error(error.message)

	}
}

export const addArrayFirebase = async (collectionName, docName, key, value) => {
	const updatedAt = new Date()
	const updatedBy = auth.currentUser.uid
	const ref = doc(db, collectionName, docName);
	await updateDoc(ref, {
		[key]: arrayUnion(value),
		updatedAt: updatedAt,
		updatedBy: updatedBy
	});
	return (
		<></>
	)
}

export const removeArrayFirebase = async (collectionName, docName, key, value) => {
	const updatedAt = new Date()
	const updatedBy = auth.currentUser.uid
	const ref = doc(db, collectionName, docName);
	await updateDoc(ref, {
		[key]: arrayRemove(value),
		updatedAt: updatedAt,
		updatedBy: updatedBy
	});

	return (
		<></>
	)

}

export const deleteDocumentFirebase = async (collectionName, docName) => {
	try {
		const docRef = doc(db, collectionName, docName);
		await deleteDoc(docRef);

		// Kembalikan pesan toast yang sesuai (bisa disesuaikan)
		return "Dokumen berhasil dihapus.";
	} catch (error) {
		console.log("Terjadi kesalahan:", error);
		throw new Error(error.message)

		throw error;
	}
};

export const uploadFileFirebase = async (data, location, stateLoading, stateData) => {

	// only receive image,video and pdf
	const storageRef = ref(storage, `user/${auth.currentUser.uid}/${data.name}`);
	const uploadTask = uploadBytesResumable(storageRef, data);

	uploadTask.on('state_changed',
		(snapshot) => {
			const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
			console.log('Upload is ' + progress + '% done');
			if (progress !== 100) stateLoading(progress)
		},
		(error) => {
			console.log(error.message)
		},
		() => {
			getDownloadURL(uploadTask.snapshot.ref)
				.then((downloadURL) => {
					console.log('File available at', downloadURL);
					const updateData = {
						...data,
						image_url: downloadURL,
					}
					stateData(updateData)
					return updateData
				})
		})

	//returns file url
	return (
		<></>
	)
}

export const deleteFileFirebase = async (fileName, location) => {
	const desertRef = ref(storage, `${location}/${fileName}`);
	deleteObject(desertRef).then(() => {
		// File deleted successfully TOAST
	}).catch((error) => {
		const errorMessage = error.message;
		throw new Error(error.message)

		// errorSlack(errorMessage)
	});

}

export const loginUser = async (email, password) => {

	return signInWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			const user = userCredential.user.email;
			// loginSlack(user)

			return { status: 'success', data: user }
		})
		.catch((error) => {
			const errorMessage = error.message;
			// errorSlack(errorMessage)

			return { status: 'failed', data: error.message }
		});
}

export const logOutUser = async () => {
	const email = auth.currentUser.email
	signOut(auth).then(() => {
		// logoutSlack(email)
	}).catch((error) => {
		// errorSlack(error)
		throw new Error(error.message)

	});
	return (
		<></>
	)
}

export const updateProfileFirebase = async (data) => {
	//make sure its not their email address beign change
	updateProfile(auth.currentUser, data).then(() => {
		console.log('success')
		return
	}).catch((error) => {
		// console.log(error)
		throw new Error(error.message)
		// errorSlack(error.message)
	});
}

export const updateDocumentFirebase = async (collectionName, docName, data) => {
	try {
		if (auth.currentUser) {
			data.lastUpdated = new Date();
			data.lastUpdatedBy = auth.currentUser.uid;
		}


		const docRef = doc(db, collectionName, docName);
		await updateDoc(docRef, data);

		// Kembalikan pesan toast yang sesuai (bisa disesuaikan)
		return "Dokumen berhasil diperbarui.";
	} catch (error) {
		console.log("Terjadi kesalahan:", error);
		throw new Error(error.message);
		throw error;


	}
};