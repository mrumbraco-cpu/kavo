
const fs = require('fs');
const path = require('path');

const tinhthanhOld = JSON.parse(fs.readFileSync('tinhthanh_old.json', 'utf8'));
const quanhuyenOld = JSON.parse(fs.readFileSync('quanhuyen_old.json', 'utf8'));
const tinhthanhPhuongxaNew = JSON.parse(fs.readFileSync('tinhthanh_phuongxa_new.json', 'utf8'));

// Process Old Geography
const provincesOldData = Object.values(tinhthanhOld).map(p => ({
    id: p.code,
    label: p.name,
    fullName: p.name_with_type
})).sort((a, b) => a.label.localeCompare(b.label));

const districtsOldDataByProvinceId = {};
Object.values(quanhuyenOld).forEach(d => {
    const province = tinhthanhOld[d.parent_code];
    if (!province) return;
    const provinceId = province.code;

    if (!districtsOldDataByProvinceId[provinceId]) {
        districtsOldDataByProvinceId[provinceId] = [];
    }
    districtsOldDataByProvinceId[provinceId].push({
        id: d.code,
        label: d.name,
        fullName: d.name_with_type
    });
});

// Sort districts
Object.keys(districtsOldDataByProvinceId).forEach(id => {
    districtsOldDataByProvinceId[id].sort((a, b) => a.label.localeCompare(b.label));
});

// Process New Geography
const provincesNewData = tinhthanhPhuongxaNew.map(p => ({
    id: p.Code,
    label: p.FullName.replace(/^(Thành phố|Tỉnh)\s+/, ''),
    fullName: p.FullName
})).sort((a, b) => a.label.localeCompare(b.label));

const wardsNewDataByProvinceId = {};
tinhthanhPhuongxaNew.forEach(p => {
    const provinceId = p.Code;
    wardsNewDataByProvinceId[provinceId] = p.Wards.map(w => ({
        id: w.Code,
        label: w.FullName,
        fullName: w.FullName
    })).sort((a, b) => a.label.localeCompare(b.label));
});

// Generate Code
let output = `/**
 * Geography constants for Old and New administrative systems.
 * Generated from JSON data.
 */

export interface GeographyItem {
    id: string;
    label: string;
    fullName: string;
}

// --- DATA STRUCTURES (Modern) ---

export const PROVINCES_OLD_DATA: readonly GeographyItem[] = ${JSON.stringify(provincesOldData, null, 2)} as const;

export const PROVINCES_NEW_DATA: readonly GeographyItem[] = ${JSON.stringify(provincesNewData, null, 2)} as const;

export const DISTRICTS_OLD_DATA_BY_PROVINCE: Record<string, readonly GeographyItem[]> = ${JSON.stringify(districtsOldDataByProvinceId, null, 2)} as const;

export const WARDS_NEW_DATA_BY_PROVINCE: Record<string, readonly GeographyItem[]> = ${JSON.stringify(wardsNewDataByProvinceId, null, 2)} as const;

// --- COMPATIBILITY LAYER (Legacy String Arrays) ---

export const PROVINCES_OLD = PROVINCES_OLD_DATA.map(p => p.label);
export const PROVINCES_NEW = PROVINCES_NEW_DATA.map(p => p.label);

// Note: Compatibility layers below will now use IDs as keys internally if we want to support legacy lookups, 
// but it's better to refactor the callers. To keep it working for labels, we trategically provide dual lookups or refactor.
// For now, let's keep the labels-as-keys for compatibility but add ID-as-keys too.

export const DISTRICTS_OLD_BY_PROVINCE_NAME: Record<string, readonly string[]> = Object.assign({}, 
    ...PROVINCES_OLD_DATA.map(p => ({ [p.label]: (DISTRICTS_OLD_DATA_BY_PROVINCE[p.id] || []).map(d => d.label) }))
);

export const WARDS_NEW_BY_PROVINCE_NAME: Record<string, readonly string[]> = Object.assign({}, 
    ...PROVINCES_NEW_DATA.map(p => ({ [p.label]: (WARDS_NEW_DATA_BY_PROVINCE[p.id] || []).map(w => w.label) }))
);

// We keep these names for now but they will be trategically replaced
export const DISTRICTS_OLD_BY_PROVINCE = DISTRICTS_OLD_BY_PROVINCE_NAME;
export const WARDS_NEW_BY_PROVINCE = WARDS_NEW_BY_PROVINCE_NAME;

// --- HELPERS ---

export const getProvinceById = (id: string, system: 'old' | 'new' = 'old') => {
    const data = system === 'old' ? PROVINCES_OLD_DATA : PROVINCES_NEW_DATA;
    return data.find(p => p.id === id);
};

export const getProvinceByName = (name: string, system: 'old' | 'new' = 'old') => {
    const data = system === 'old' ? PROVINCES_OLD_DATA : PROVINCES_NEW_DATA;
    return data.find(p => p.label === name);
};

export const getDistrictById = (provinceId: string, districtId: string) => {
    return (DISTRICTS_OLD_DATA_BY_PROVINCE[provinceId] || []).find(d => d.id === districtId);
};

export const getWardById = (provinceId: string, wardId: string) => {
    return (WARDS_NEW_DATA_BY_PROVINCE[provinceId] || []).find(w => w.id === wardId);
};
`;

fs.writeFileSync('lib/constants/geography.ts', output);
console.log('Successfully updated geography.ts with ID-indexed data');
