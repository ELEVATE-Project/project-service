/**
 * name : cache.js
 * author : prajwal
 * created-date : 21-Apr-2026
 * Description : cache related functions.
 */

const NodeCache = require('node-cache')

const tenantCache = new NodeCache()
const CACHE_TTL_SECONDS = Number(process.env.TENANT_CACHE_TTL)

/**
 * getCache data based on the passed tenantId
 * @method
 * @name getCache
 * @param {string} tenantId - tenantId details
 * @returns {JSON} sucess data.
 */

function getCache(tenantId) {
	return tenantCache.get(tenantId) || null
}

/**
 * setCache based on the passed tenantId
 * @method
 * @name setCache
 * @param {string} tenantId - tenantId details
 * @param {JSON} data - data to be cached
 */

function setCache(tenantId, data) {
	tenantCache.set(tenantId, data, CACHE_TTL_SECONDS)
}

/**
 * clearTenantCache based on the passed tenantId
 * @method
 * @name clearCache
 * @param {string} cacheIdentifier - tenantId details
 * @returns {JSON} successObject.
 */

function clearCache(cacheIdentifier) {
	const deleted = tenantCache.del(cacheIdentifier)
	return {
		success: true,
		message: deleted ? `Cache cleared for  ${cacheIdentifier}` : `No cache found for  ${cacheIdentifier}`,
	}
}

module.exports = { getCache, setCache, clearCache }
