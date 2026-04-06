-- ================================
-- USERS
-- ================================
INSERT INTO public.users
(id, name, email, email_verified, roles, status, password,
 has_accepted_terms_and_conditions, about, location, languages,
 preferred_language, share_link, image, custom_entity_text, meta,
 created_at, updated_at, deleted_at, tenant_code, phone, phone_code, configs)
VALUES
(1, 'Rahul R B', 'a0db5e0a39ee13db7fc5d1309e637f2c', false, '{8,2}', 'ACTIVE',
 '$2a$10$NTzc2CjEbwB4DavjEKU11eqJXJLrODnvAwvXWor9Dz/gXr55Pvyj.', true,
 NULL, NULL, NULL, 'en', NULL, NULL, NULL, NULL,
 '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.426+00',
 NULL, 'default', NULL, NULL, NULL),

(2, 'Prajwal C S', 'c4113be1bc2cef51981a6ec687302e42fc4f87f4dfac4276584844d9e3e0f5ae', false, '{8,2}', 'ACTIVE',
 '$2a$10$NTzc2CjEbwB4DavjEKU11eqJXJLrODnvAwvXWor9Dz/gXr55Pvyj.', true,
 NULL, NULL, NULL, 'en', NULL, NULL, NULL, NULL,
 '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.426+00',
 NULL, 'default', NULL, NULL, NULL),

(3, 'Vishnu V P', '1092be87fd483fce1deba56c8cdefa79bed4f70a4b110fc4e7947c57aacff219', false, '{8,2}', 'ACTIVE',
 '$2a$10$NTzc2CjEbwB4DavjEKU11eqJXJLrODnvAwvXWor9Dz/gXr55Pvyj.', true,
 NULL, NULL, NULL, 'en', NULL, NULL, NULL, NULL,
 '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.426+00',
 NULL, 'default', NULL, NULL, NULL),

(4, 'Mallanagouda R B', 'e5fc674d4b1a54c6cf772485e3bca6f7ae14b60de32b9f0cd9f955ee469345bc', false, '{8,2}', 'ACTIVE',
 '$2a$10$NTzc2CjEbwB4DavjEKU11eqJXJLrODnvAwvXWor9Dz/gXr55Pvyj.', true,
 NULL, NULL, NULL, 'en', NULL, NULL, NULL, NULL,
 '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.426+00',
 NULL, 'default', NULL, NULL, NULL);

-- ================================
-- USER ORGANIZATIONS
-- ================================
INSERT INTO public.user_organizations
(user_id, organization_code, tenant_code, created_at, updated_at, deleted_at)
VALUES
(1, 'default_code', 'default', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL),
(2, 'default_code', 'default', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL),
(3, 'default_code', 'default', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL),
(4, 'default_code', 'default', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL);

-- ================================
-- USER ORGANIZATION ROLES
-- ================================
INSERT INTO public.user_organization_roles
(tenant_code, user_id, organization_code, role_id, created_at, updated_at, deleted_at)
VALUES
('default', 2, 'default_code', 1, '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL),
('default', 3, 'default_code', 8, '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL),
('default', 2, 'default_code', 8, '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL),
('default', 4, 'default_code', 8, '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL);

-- ================================
-- TENANT UPDATE
-- ================================
UPDATE public.tenants
SET meta = '{
  "factors": ["professional_role", "professional_subroles"],
  "observableEntityKeys": ["professional_subroles"],
  "optional_factors": ["state", "district", "block", "cluster", "school"],
  "validationExcludedScopeKeys": ["language", "gender"],
  "portalSignInUrl": "https://shikshagrah-qa.tekdinext.com/register"
}'
WHERE code = 'default';

-- ================================
-- ENTITY TYPES
-- ================================
INSERT INTO public.entity_types
(id, value, label, status, created_by, updated_by, allow_filtering,
 data_type, organization_id, parent_id, has_entities, allow_custom_entities,
 model_names, created_at, updated_at, deleted_at, meta,
 external_entity_type, required, regex, tenant_code, organization_code)
VALUES
(5, 'state', 'State', 'ACTIVE', 0, 0, true, 'STRING', 1, NULL, true, true,
 '{User}', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00',
 NULL, '{"service":"entity-management-service","endPoint":"v1/entities/find"}',
 true, false, NULL, 'default', 'default_code'),

(6, 'block', 'Block', 'ACTIVE', 0, 0, true, 'STRING', 1, NULL, true, true,
 '{User}', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00',
 NULL, '{"service":"entity-management-service","endPoint":"v1/entities/find"}',
 true, false, NULL, 'default', 'default_code'),

(7, 'school', 'School', 'ACTIVE', 0, 0, true, 'STRING', 1, NULL, true, true,
 '{User}', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00',
 NULL, '{"service":"entity-management-service","endPoint":"v1/entities/find"}',
 true, false, NULL, 'default', 'default_code'),

(8, 'district', 'District', 'ACTIVE', 0, 0, true, 'STRING', 1, NULL, true, true,
 '{User}', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00',
 NULL, '{"service":"entity-management-service","endPoint":"v1/entities/find"}',
 true, false, NULL, 'default', 'default_code'),

(9, 'cluster', 'Cluster', 'ACTIVE', 0, 0, true, 'STRING', 1, NULL, true, true,
 '{User}', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00',
 NULL, '{"service":"entity-management-service","endPoint":"v1/entities/find"}',
 true, false, NULL, 'default', 'default_code'),

(10, 'professional_role', 'Professional Role', 'ACTIVE', 0, 0, true, 'STRING', 1, NULL, true, true,
 '{User}', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00',
 NULL, '{"service":"entity-management-service","endPoint":"v1/entities/find"}',
 true, false, NULL, 'default', 'default_code'),

(11, 'professional_subroles', 'Professional Subroles', 'ACTIVE', 0, 0, true, 'STRING', 1, NULL, true, true,
 '{User}', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00',
 NULL, '{"service":"entity-management-service","endPoint":"v1/entities/find"}',
 true, false, NULL, 'default', 'default_code');

-- ================================
-- SEQUENCES
-- ================================
SELECT setval('users_id_seq', (SELECT MAX(id) FROM public.users));