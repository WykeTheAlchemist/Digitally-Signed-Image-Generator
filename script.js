const photoUpload = document.getElementById('photo-upload');
const generateSignature = document.getElementById('generate-signature');
const downloadSignedPhoto = document.getElementById('download-signed-photo');

generateSignature.addEventListener('click', async () => {
  const file = photoUpload.files[0];
  const reader = new FileReader();
  reader.onload = async (e) => {
    const imageData = e.target.result;

		// Generate key pair
		const keyPair = await openpgp.generateKey({
			numBits: 2048,
			userID: 'John Doe <john.doe@example.com>'
		});

		// Get private key
		const privateKey = keyPair.privateKeyArmored;

		// Generate hash
		const hash = await crypto.subtle.digest('SHA-256', imageData);

		// Generate digital fingerprint
		const digitalFingerprint = await openpgp.fingerprint.fromHash(hash);

		// Generate PGP signature
		const signature = await openpgp.sign({
			message: imageData,
			privateKeys: [privateKey],
			detached: true
		});

   // Create signed photo blob
    const signedPhotoBlob = new Blob([imageData, signature], { type: 'image/jpeg' });

    // Update download button href attribute
    downloadSignedPhoto.href = URL.createObjectURL(signedPhotoBlob);
    downloadSignedPhoto.download = 'signed-photo.jpg';

    // Add click event listener to download button
    downloadSignedPhoto.addEventListener('click', () => {
      // Remove href attribute after download
      downloadSignedPhoto.href = '';
    });
  };
  reader.readAsArrayBuffer(file);
});
