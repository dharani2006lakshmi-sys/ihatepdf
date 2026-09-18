// Multi-Account Cloudinary Engine with Auto-Rotation & Load Balancing (Up to 100GB+ Pool)

// Load accounts from LocalStorage or Environment
function loadAccounts() {
  try {
    const saved = localStorage.getItem('ihatepdf_cloudinary_accounts');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  // Load from environment variables (Accounts 1 to 4)
  const envAccounts = [];
  for (let i = 1; i <= 4; i++) {
    const name = import.meta.env[`VITE_CLOUDINARY_CLOUD_NAME_${i}`] || (i === 1 ? import.meta.env.VITE_CLOUDINARY_CLOUD_NAME : '');
    const preset = import.meta.env[`VITE_CLOUDINARY_UPLOAD_PRESET_${i}`] || (i === 1 ? import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET : '');
    const apiKey = import.meta.env[`VITE_CLOUDINARY_API_KEY_${i}`] || '';
    
    if (name && preset) {
      envAccounts.push({ cloudName: name, uploadPreset: preset, apiKey });
    }
  }

  if (envAccounts.length > 0) {
    return envAccounts;
  }

  // Fallback to single account config if set in localStorage
  const singleName = localStorage.getItem('ihatepdf_cloudinary_name') || '';
  const singlePreset = localStorage.getItem('ihatepdf_cloudinary_preset') || '';
  
  if (singleName && singlePreset) {
    return [{ cloudName: singleName, uploadPreset: singlePreset }];
  }

  return [];
}

let accounts = loadAccounts();
let currentAccountIndex = 0;

// Save multi-account pool
export function setCloudinaryAccounts(accList) {
  const cleanList = accList.filter(a => a.cloudName && a.uploadPreset);
  accounts = cleanList;
  localStorage.setItem('ihatepdf_cloudinary_accounts', JSON.stringify(cleanList));
  if (cleanList.length > 0) {
    localStorage.setItem('ihatepdf_cloudinary_name', cleanList[0].cloudName);
    localStorage.setItem('ihatepdf_cloudinary_preset', cleanList[0].uploadPreset);
  }
}

export function getCloudinaryAccounts() {
  return accounts;
}

export function isCloudinaryConfigured() {
  return accounts.length > 0;
}

// Upload with Automatic Multi-Account Failover & Load Balancing
export async function uploadToCloudinary(fileBlob, fileName, tags = ['ihatepdf', '7day_vault']) {
  if (accounts.length === 0) {
    return null;
  }

  const isImage = fileBlob.type.startsWith('image/');
  const resourceType = isImage ? 'image' : 'raw';

  // Try accounts in rotation, with fallback on error
  let attempts = 0;
  while (attempts < accounts.length) {
    const activeAcc = accounts[currentAccountIndex % accounts.length];
    currentAccountIndex = (currentAccountIndex + 1) % accounts.length;

    try {
      const formData = new FormData();
      formData.append('file', fileBlob, fileName);
      formData.append('upload_preset', activeAcc.uploadPreset);
      formData.append('tags', tags.join(','));

      const url = `https://api.cloudinary.com/v1_1/${activeAcc.cloudName}/${resourceType}/upload`;

      const res = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        publicId: data.public_id,
        secureUrl: data.secure_url,
        cloudName: activeAcc.cloudName,
        format: data.format || fileName.split('.').pop(),
        bytes: data.bytes,
        createdAt: data.created_at || new Date().toISOString(),
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
      };
    } catch (err) {
      console.warn(`Upload failed on account "${activeAcc.cloudName}". Trying next account in pool...`, err);
      attempts++;
    }
  }

  console.error('All Cloudinary accounts failed or exceeded limits.');
  return null;
}
