#!/bin/bash
sudo -u postgres psql -p 5432 -d users -c "INSERT INTO public.users (id, name, email, email_verified, roles, status, password, has_accepted_terms_and_conditions, about, location, languages, preferred_language, share_link, image, custom_entity_text, meta, created_at, updated_at, deleted_at, tenant_code, phone, phone_code, configs) VALUES (1, 'Rahul R B', 'a0db5e0a39ee13db7fc5d1309e637f2c', false, '{8,2}', 'ACTIVE', '\$2a\$10\$NTzc2CjEbwB4DavjEKU11eqJXJLrODnvAwvXWor9Dz/gXr55Pvyj.', true, NULL, NULL, NULL, 'en', NULL, NULL, NULL, NULL, '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.426+00', NULL, 'default','53bc5d0ff0c53bee460c08b8afe087455050dc7529a2f1d4f7319c0da653a7e4','+91', NULL);"
sudo -u postgres psql -p 5432 -d users -c "INSERT INTO public.users (id, name, email, email_verified, roles, status, password, has_accepted_terms_and_conditions, about, location, languages, preferred_language, share_link, image, custom_entity_text, meta, created_at, updated_at, deleted_at, tenant_code, phone, phone_code, configs) VALUES (2, 'Prajwal C S', 'c4113be1bc2cef51981a6ec687302e42fc4f87f4dfac4276584844d9e3e0f5ae', false, '{8,2}', 'ACTIVE', '\$2a\$10\$NTzc2CjEbwB4DavjEKU11eqJXJLrODnvAwvXWor9Dz/gXr55Pvyj.', true, NULL, NULL, NULL, 'en', NULL, NULL, NULL, NULL, '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.426+00', NULL, 'default','53bc5d0ff0c53bee460c08b8afe087455050dc7529a2f1d4f7319c0da653a767','+91', NULL);"
sudo -u postgres psql -p 5432 -d users -c "INSERT INTO public.users (id, name, email, email_verified, roles, status, password, has_accepted_terms_and_conditions, about, location, languages, preferred_language, share_link, image, custom_entity_text, meta, created_at, updated_at, deleted_at, tenant_code, phone, phone_code, configs) VALUES (3, 'Vishnu V P', '1092be87fd483fce1deba56c8cdefa79bed4f70a4b110fc4e7947c57aacff219', false, '{8,2}', 'ACTIVE', '\$2a\$10\$NTzc2CjEbwB4DavjEKU11eqJXJLrODnvAwvXWor9Dz/gXr55Pvyj.', true, NULL, NULL, NULL, 'en', NULL, NULL, NULL, NULL, '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.426+00', NULL, 'default','53bc5d0ff0c53bee460c08b8afe087455050dc7529a2f1d4f7319c0da653a7e0','+91', NULL);"
sudo -u postgres psql -p 5432 -d users -c "INSERT INTO public.users (id, name, email, email_verified, roles, status, password, has_accepted_terms_and_conditions, about, location, languages, preferred_language, share_link, image, custom_entity_text, meta, created_at, updated_at, deleted_at, tenant_code, phone, phone_code, configs) VALUES (4, 'Mallanagouda R B', 'e5fc674d4b1a54c6cf772485e3bca6f7ae14b60de32b9f0cd9f955ee469345bc', false, '{8,2}', 'ACTIVE', '\$2a\$10\$NTzc2CjEbwB4DavjEKU11eqJXJLrODnvAwvXWor9Dz/gXr55Pvyj.', true, NULL, NULL, NULL, 'en', NULL, NULL, NULL, NULL, '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.426+00', NULL, 'default','53bc5d0ff0c53bee460c08b8afe087455050dc7529a2f1d4f7319c0da653a700','+91', NULL);"

# --- 2. INSERT INTO public.user_organizations ---
# FIXES:
# - Quoted the organization_code and tenant_code variables.
sudo -u postgres psql -p 5432 -d users -c "INSERT INTO public.user_organizations (user_id,organization_code, tenant_code, created_at, updated_at, deleted_at) VALUES (1, 'default_code', 'default', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL);"
sudo -u postgres psql -p 5432 -d users -c "INSERT INTO public.user_organizations (user_id,organization_code, tenant_code, created_at, updated_at, deleted_at) VALUES (2, 'default_code', 'default', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL);"
sudo -u postgres psql -p 5432 -d users -c "INSERT INTO public.user_organizations (user_id,organization_code, tenant_code, created_at, updated_at, deleted_at) VALUES (3, 'default_code', 'default', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL);"
sudo -u postgres psql -p 5432 -d users -c "INSERT INTO public.user_organizations (user_id,organization_code, tenant_code, created_at, updated_at, deleted_at) VALUES (4, 'default_code', 'default', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL);"


sudo -u postgres psql -p 5432 -d user -c "
UPDATE public.tenants
SET meta = '{ 
  \"factors\": [\"professional_role\", \"professional_subroles\"],
  \"observableEntityKeys\": [\"professional_subroles\"],
  \"optional_factors\": [\"state\", \"district\", \"block\", \"cluster\", \"school\"],
  \"validationExcludedScopeKeys\": [\"language\", \"gender\"],
  \"portalSignInUrl\": \"https://shikshagrah-qa.tekdinext.com/register\"
}'
WHERE code = 'default';
"


# FIXES:
# - Quoted the organization_code and tenant_code variables.
sudo -u postgres psql -p 5432 -d users -c "INSERT INTO public.user_organization_roles (tenant_code, user_id, organization_code,role_id, created_at, updated_at, deleted_at) VALUES ('default', 2, 'default_code', 1, '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL);"
sudo -u postgres psql -p 5432 -d users -c "INSERT INTO public.user_organization_roles (tenant_code, user_id, organization_code,role_id, created_at, updated_at, deleted_at) VALUES ('default', 3, 'default_code', 2, '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL);"
sudo -u postgres psql -p 5432 -d users -c "INSERT INTO public.user_organization_roles (tenant_code, user_id, organization_code,role_id, created_at, updated_at, deleted_at) VALUES ('default', 2, 'default_code', 3, '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL);"
sudo -u postgres psql -p 5432 -d users -c "INSERT INTO public.user_organization_roles (tenant_code, user_id, organization_code,role_id, created_at, updated_at, deleted_at) VALUES ('default', 4, 'default_code', 3, '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL);"


sudo -u postgres psql -p 5432 -d users -c "INSERT INTO public.entity_types (id, value, label, status, created_by, updated_by, allow_filtering, data_type, organization_id, parent_id, has_entities, allow_custom_entities, model_names, created_at, updated_at, deleted_at, meta, external_entity_type, required, regex) VALUES (4, 'state', 'State', 'ACTIVE', 0, 0, true, 'STRING', 1, NULL, true, true, '{User}', '2024-04-18 08:12:19.394+00', '2024-04-18 08:12:19.394+00', NULL, NULL, true, false, NULL);"
sudo -u postgres psql -p 5432 -d users -c "UPDATE public.entity_types SET status = 'INACTIVE' WHERE id = 3;"
sudo -u postgres psql -p 5432 -d users -c "SELECT nextval('users_id_seq'::regclass) FROM public.users;"
sudo -u postgres psql -p 5432 -d users -c "SELECT nextval('users_credentials_id_seq'::regclass) FROM public.users_credentials;"
sudo -u postgres psql -p 5432 -d users -c "UPDATE role_permission_mapping SET role_title = 'state_education_officer' WHERE role_title = 'mentor';"
sudo -u postgres psql -p 5432 -d users -c "SELECT NULL;"
