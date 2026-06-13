--
-- PostgreSQL database dump
--

\restrict ohPCO8eTwpgu35MrxqwuWRMHzRkfABMPvtmnWVHOT4WYCwUQgoh4i6TDaqyQfhR

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	e4952765-2fcf-44b7-8821-13c99353b5e9	authenticated	authenticated	dperez@gmail.com	$2a$10$L/rNKInQrNTKIICqtO.MPO/3ni2SiCONfkw3ID01YGWRzXmx.ookS	2026-06-10 22:41:42.64726+00	\N		\N		\N			\N	2026-06-10 22:41:42.653044+00	{"provider": "email", "providers": ["email"]}	{"sub": "e4952765-2fcf-44b7-8821-13c99353b5e9", "email": "dperez@gmail.com", "nombre": "Daniel", "apellido": "Perez", "email_verified": true, "phone_verified": false}	\N	2026-06-10 22:41:42.616688+00	2026-06-10 22:41:42.658502+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b9eabdb4-bf05-4581-9f3f-1a28bf7128fa	authenticated	authenticated	jperez@gmail.com	$2a$10$rArEO661uvnSKKQHsE8AjuB4WSBdnJ3jvsGElrrCsIJb9NyySihCu	2026-06-06 21:59:14.922455+00	\N		\N		\N			\N	2026-06-10 22:39:05.372992+00	{"provider": "email", "providers": ["email"]}	{"sub": "b9eabdb4-bf05-4581-9f3f-1a28bf7128fa", "email": "jperez@gmail.com", "nombre": "Juan", "apellido": "Perez", "email_verified": true, "phone_verified": false}	\N	2026-06-06 21:59:14.910157+00	2026-06-11 01:38:41.274353+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ce8137fb-b064-44ca-b311-8873ed80760f	authenticated	authenticated	fvolonte@gmail.com	$2a$10$PQVmjvOIRXvGcNlBTMo6UuODEjcaRqiwXi2i5v11nj2SQ0IaodbiW	2026-06-07 03:14:01.072327+00	\N		\N		\N			\N	2026-06-12 01:59:23.098418+00	{"provider": "email", "providers": ["email"]}	{"sub": "ce8137fb-b064-44ca-b311-8873ed80760f", "email": "fvolonte@gmail.com", "nombre": "Federico", "apellido": "Volonte", "email_verified": true, "phone_verified": false}	\N	2026-06-07 03:14:01.042599+00	2026-06-12 01:59:23.139492+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4c8744f3-c044-49c3-a42e-97bac2bd7265	authenticated	authenticated	mmethol@gmail.com	$2a$10$PKj2R0t9FzqHSNTWHUuOJ.MP.ThyyKoVR2I9RJwtUNHHi2W334dNe	2026-06-07 02:58:23.381155+00	\N		\N		\N			\N	2026-06-12 02:17:11.675361+00	{"provider": "email", "providers": ["email"]}	{"sub": "4c8744f3-c044-49c3-a42e-97bac2bd7265", "email": "mmethol@gmail.com", "nombre": "Marcos", "apellido": "Methol", "email_verified": true, "phone_verified": false}	\N	2026-06-07 02:58:23.320259+00	2026-06-12 02:17:11.677652+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a8162597-af98-4abd-92ec-aa4cdee8b760	authenticated	authenticated	pmethol94@gmail.com	$2a$10$BuMoyeo7/Aq1vsFCRv0Eje3Xf0YJMuN4CY/ZuhOBRHUySJ1510Q3y	2026-06-06 21:44:38.9339+00	\N		\N		\N			\N	2026-06-12 02:16:25.486409+00	{"provider": "email", "providers": ["email"]}	{"sub": "a8162597-af98-4abd-92ec-aa4cdee8b760", "email": "pmethol94@gmail.com", "nombre": "Pedro", "apellido": "Methol", "email_verified": true, "phone_verified": false}	\N	2026-06-06 21:44:38.910428+00	2026-06-12 16:52:33.223889+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	aff743af-2352-4997-93b3-42d8859dfd7e	authenticated	authenticated	lmethol@gmail.com	$2a$10$k.HbaSO4D86ZM/EJ0r2V5.f6gyjNYfMHeJzg.NPk84xwCRVfx2Eg2	2026-06-06 21:45:27.232513+00	\N		\N		\N			\N	2026-06-11 19:03:41.375374+00	{"provider": "email", "providers": ["email"]}	{"sub": "aff743af-2352-4997-93b3-42d8859dfd7e", "email": "lmethol@gmail.com", "nombre": "Lucas", "apellido": "Methol", "email_verified": true, "phone_verified": false}	\N	2026-06-06 21:45:27.22566+00	2026-06-11 19:03:41.378827+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
a8162597-af98-4abd-92ec-aa4cdee8b760	a8162597-af98-4abd-92ec-aa4cdee8b760	{"sub": "a8162597-af98-4abd-92ec-aa4cdee8b760", "email": "pmethol94@gmail.com", "nombre": "Pedro", "apellido": "Methol", "email_verified": false, "phone_verified": false}	email	2026-06-06 21:44:38.930504+00	2026-06-06 21:44:38.930562+00	2026-06-06 21:44:38.930562+00	a0e3abff-69ee-4283-8a8b-f5e3d56969e9
aff743af-2352-4997-93b3-42d8859dfd7e	aff743af-2352-4997-93b3-42d8859dfd7e	{"sub": "aff743af-2352-4997-93b3-42d8859dfd7e", "email": "lmethol@gmail.com", "nombre": "Lucas", "apellido": "Methol", "email_verified": false, "phone_verified": false}	email	2026-06-06 21:45:27.230438+00	2026-06-06 21:45:27.230484+00	2026-06-06 21:45:27.230484+00	0843ef73-9e1a-4922-9b87-8aa3957cba93
b9eabdb4-bf05-4581-9f3f-1a28bf7128fa	b9eabdb4-bf05-4581-9f3f-1a28bf7128fa	{"sub": "b9eabdb4-bf05-4581-9f3f-1a28bf7128fa", "email": "jperez@gmail.com", "nombre": "Juan", "apellido": "Perez", "email_verified": false, "phone_verified": false}	email	2026-06-06 21:59:14.919572+00	2026-06-06 21:59:14.919623+00	2026-06-06 21:59:14.919623+00	6958957d-d9e2-41db-8fd5-5d3d729ab247
4c8744f3-c044-49c3-a42e-97bac2bd7265	4c8744f3-c044-49c3-a42e-97bac2bd7265	{"sub": "4c8744f3-c044-49c3-a42e-97bac2bd7265", "email": "mmethol@gmail.com", "nombre": "Marcos", "apellido": "Methol", "email_verified": false, "phone_verified": false}	email	2026-06-07 02:58:23.374011+00	2026-06-07 02:58:23.374075+00	2026-06-07 02:58:23.374075+00	5c49ac0d-8e7d-4132-87d6-3f3715caa238
ce8137fb-b064-44ca-b311-8873ed80760f	ce8137fb-b064-44ca-b311-8873ed80760f	{"sub": "ce8137fb-b064-44ca-b311-8873ed80760f", "email": "fvolonte@gmail.com", "nombre": "Federico", "apellido": "Volonte", "email_verified": false, "phone_verified": false}	email	2026-06-07 03:14:01.069549+00	2026-06-07 03:14:01.069599+00	2026-06-07 03:14:01.069599+00	50524a82-1c36-4cb0-adc5-fc0ee7c2b4e6
e4952765-2fcf-44b7-8821-13c99353b5e9	e4952765-2fcf-44b7-8821-13c99353b5e9	{"sub": "e4952765-2fcf-44b7-8821-13c99353b5e9", "email": "dperez@gmail.com", "nombre": "Daniel", "apellido": "Perez", "email_verified": false, "phone_verified": false}	email	2026-06-10 22:41:42.642829+00	2026-06-10 22:41:42.642888+00	2026-06-10 22:41:42.642888+00	ff666e4b-7afd-4433-ae03-471701732765
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
1719ee25-714d-42e2-bd58-3d23fd064f7c	aff743af-2352-4997-93b3-42d8859dfd7e	2026-06-07 20:51:53.040333+00	2026-06-08 00:30:17.94271+00	\N	aal1	\N	2026-06-08 00:30:17.942609	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	179.29.253.100	\N	\N	\N	\N	\N
bf352a7b-8c1a-4101-befe-a3db64361f53	aff743af-2352-4997-93b3-42d8859dfd7e	2026-06-10 14:51:30.705867+00	2026-06-10 14:51:30.705867+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.228.51	\N	\N	\N	\N	\N
edf7d167-8ef5-4fda-af6d-e2477b1ba75b	aff743af-2352-4997-93b3-42d8859dfd7e	2026-06-10 15:25:34.917268+00	2026-06-10 15:25:34.917268+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.228.51	\N	\N	\N	\N	\N
4c67ae53-53d4-4a26-a230-71f78160c581	4c8744f3-c044-49c3-a42e-97bac2bd7265	2026-06-11 22:35:38.510373+00	2026-06-12 00:43:42.263574+00	\N	aal1	\N	2026-06-12 00:43:42.263459	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36	179.29.196.78	\N	\N	\N	\N	\N
7a1c76ba-7ddf-4c8d-898a-6f3dbc6c29d8	aff743af-2352-4997-93b3-42d8859dfd7e	2026-06-10 19:19:03.275166+00	2026-06-10 20:29:28.381379+00	\N	aal1	\N	2026-06-10 20:29:28.381254	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.228.136	\N	\N	\N	\N	\N
79f80d72-d163-4c57-b985-ae938b4fec29	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-11 05:28:02.479751+00	2026-06-12 16:52:33.237042+00	\N	aal1	\N	2026-06-12 16:52:33.236932	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.27.65.218	\N	\N	\N	\N	\N
ea5688e6-c7b4-4f24-a8cb-fc62cd4def66	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-11 23:42:30.789638+00	2026-06-12 01:31:56.028559+00	\N	aal1	\N	2026-06-12 01:31:56.028439	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.29.196.78	\N	\N	\N	\N	\N
27da437e-1bde-48ef-b87c-f1ce993be49e	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-11 02:30:54.393709+00	2026-06-11 04:28:21.359531+00	\N	aal1	\N	2026-06-11 04:28:21.359395	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.29.228.136	\N	\N	\N	\N	\N
2d1b090d-8d60-4c65-81e1-b7a419afa072	ce8137fb-b064-44ca-b311-8873ed80760f	2026-06-11 02:31:09.095247+00	2026-06-11 04:28:26.776869+00	\N	aal1	\N	2026-06-11 04:28:26.776773	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.228.136	\N	\N	\N	\N	\N
44489017-9a51-4e4a-9d5c-0ed6377cfdfb	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-11 05:13:24.400937+00	2026-06-11 05:13:24.400937+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.29.228.136	\N	\N	\N	\N	\N
c5075116-9095-4ea4-9024-bd661c22bff6	aff743af-2352-4997-93b3-42d8859dfd7e	2026-06-10 22:40:07.867564+00	2026-06-10 22:40:07.867564+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.29.228.136	\N	\N	\N	\N	\N
16046175-7a1f-49ac-8888-207f7355011e	4c8744f3-c044-49c3-a42e-97bac2bd7265	2026-06-10 22:40:46.719563+00	2026-06-10 22:40:46.719563+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.228.136	\N	\N	\N	\N	\N
fc2f0017-c671-4c14-a066-a8e6a0972118	e4952765-2fcf-44b7-8821-13c99353b5e9	2026-06-10 22:41:42.655029+00	2026-06-10 22:41:42.655029+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.228.136	\N	\N	\N	\N	\N
4dade114-fd45-486e-a35b-309d5f2e2f87	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-11 19:03:19.128604+00	2026-06-11 19:03:19.128604+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.27.65.218	\N	\N	\N	\N	\N
6454ddd2-881b-4238-a336-e4f856f1ffcf	aff743af-2352-4997-93b3-42d8859dfd7e	2026-06-11 19:03:41.375465+00	2026-06-11 19:03:41.375465+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.27.65.218	\N	\N	\N	\N	\N
fd451beb-ee3a-49ed-83bd-4b120201f085	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-11 20:05:52.513082+00	2026-06-11 20:05:52.513082+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.27.65.218	\N	\N	\N	\N	\N
78b64716-7011-40ac-b8ac-2b3f6addf752	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-11 20:06:52.488005+00	2026-06-11 20:06:52.488005+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.27.65.218	\N	\N	\N	\N	\N
45bfeb34-29b1-46c4-8340-f7ad6e66b172	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-11 20:07:33.045595+00	2026-06-11 20:07:33.045595+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.27.65.218	\N	\N	\N	\N	\N
06f5b7e6-ade3-4a43-b2e5-4c0d2dfd0d9c	4c8744f3-c044-49c3-a42e-97bac2bd7265	2026-06-07 02:58:23.393442+00	2026-06-07 02:58:23.393442+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.253.92	\N	\N	\N	\N	\N
817f6f21-cb30-4d2c-b26a-feecf1bcb727	4c8744f3-c044-49c3-a42e-97bac2bd7265	2026-06-07 02:58:36.318374+00	2026-06-07 02:58:36.318374+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.253.92	\N	\N	\N	\N	\N
802683ee-59e8-4a4d-a0b8-572adc3a57d8	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-11 20:08:19.545438+00	2026-06-11 20:08:19.545438+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.27.65.218	\N	\N	\N	\N	\N
3308cda8-9761-4425-9565-afd722480a8d	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-11 20:09:11.33133+00	2026-06-11 20:09:11.33133+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.27.65.218	\N	\N	\N	\N	\N
931e75eb-98f7-4102-9d47-f7e084de9402	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-11 20:29:24.327604+00	2026-06-11 20:29:24.327604+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.27.65.218	\N	\N	\N	\N	\N
fc3cce87-e5b9-4fd7-b1ee-6538db9ccdab	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-11 20:29:47.115615+00	2026-06-11 20:29:47.115615+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.27.65.218	\N	\N	\N	\N	\N
8f58698a-b71f-4ddb-9c8a-ce24c58367e1	4c8744f3-c044-49c3-a42e-97bac2bd7265	2026-06-07 03:12:16.295602+00	2026-06-07 03:12:16.295602+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.253.92	\N	\N	\N	\N	\N
ed637bf4-94bf-4670-81ca-61cf217372bc	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-12 01:32:42.974391+00	2026-06-12 01:32:42.974391+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.29.196.78	\N	\N	\N	\N	\N
d739e867-d2e9-4bfa-a9a2-6473dd78186e	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-12 02:16:25.487557+00	2026-06-12 02:16:25.487557+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.29.196.78	\N	\N	\N	\N	\N
cc6bff72-9da7-4815-b443-66232c91182f	4c8744f3-c044-49c3-a42e-97bac2bd7265	2026-06-12 02:17:11.675454+00	2026-06-12 02:17:11.675454+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.196.78	\N	\N	\N	\N	\N
3818907c-b794-49c0-9343-69be6954cd69	aff743af-2352-4997-93b3-42d8859dfd7e	2026-06-10 14:39:33.53902+00	2026-06-10 14:39:33.53902+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.228.51	\N	\N	\N	\N	\N
31d28656-9187-4182-b18e-8f6950aec3e2	aff743af-2352-4997-93b3-42d8859dfd7e	2026-06-07 03:13:30.636272+00	2026-06-07 03:13:30.636272+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	179.29.253.92	\N	\N	\N	\N	\N
ce346ea3-87ef-45aa-80ef-6a3b030e884b	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-11 22:21:02.150734+00	2026-06-11 23:31:53.486582+00	\N	aal1	\N	2026-06-11 23:31:53.486481	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.29.196.78	\N	\N	\N	\N	\N
8bdf3833-b0dd-4c1e-9b11-b8fddb835f2d	aff743af-2352-4997-93b3-42d8859dfd7e	2026-06-07 05:39:20.681819+00	2026-06-07 06:44:35.133398+00	\N	aal1	\N	2026-06-07 06:44:35.133243	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	179.29.217.166	\N	\N	\N	\N	\N
e688fc21-c313-4b51-b26a-1e274bcf2651	4c8744f3-c044-49c3-a42e-97bac2bd7265	2026-06-10 16:15:47.775487+00	2026-06-10 16:15:47.775487+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.228.51	\N	\N	\N	\N	\N
3d306f7f-9ce1-4667-90ad-31618a11a10e	aff743af-2352-4997-93b3-42d8859dfd7e	2026-06-07 06:47:40.255243+00	2026-06-07 06:47:40.255243+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	179.29.217.166	\N	\N	\N	\N	\N
b4119b14-52f4-401d-b8bd-3960340f71a5	4c8744f3-c044-49c3-a42e-97bac2bd7265	2026-06-07 06:48:00.595985+00	2026-06-07 06:48:00.595985+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	179.29.217.166	\N	\N	\N	\N	\N
8552de5c-d83e-4db4-aba1-cd81ed0d526d	4c8744f3-c044-49c3-a42e-97bac2bd7265	2026-06-10 16:54:32.148729+00	2026-06-10 16:54:32.148729+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.228.51	\N	\N	\N	\N	\N
e7bc19c1-bd1e-4580-b2be-5c4688d4b375	aff743af-2352-4997-93b3-42d8859dfd7e	2026-06-07 17:15:59.246659+00	2026-06-07 18:23:04.866135+00	\N	aal1	\N	2026-06-07 18:23:04.865989	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	179.29.217.166	\N	\N	\N	\N	\N
e48601e7-77e3-44c9-a6b8-c84e463acb06	ce8137fb-b064-44ca-b311-8873ed80760f	2026-06-11 23:51:34.091688+00	2026-06-12 01:33:03.772248+00	\N	aal1	\N	2026-06-12 01:33:03.772133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.196.78	\N	\N	\N	\N	\N
fec34f21-f2fc-4ea1-b9b9-3ff2694272e0	ce8137fb-b064-44ca-b311-8873ed80760f	2026-06-12 01:59:23.099643+00	2026-06-12 01:59:23.099643+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.196.78	\N	\N	\N	\N	\N
1648c55b-0e51-4b1b-9e67-a372b1f0f162	ce8137fb-b064-44ca-b311-8873ed80760f	2026-06-11 01:37:43.202922+00	2026-06-11 01:37:43.202922+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.228.136	\N	\N	\N	\N	\N
9a0eaf9b-a5be-4868-a6f7-425b70843fc1	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-11 04:40:46.843405+00	2026-06-11 04:40:46.843405+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.29.228.136	\N	\N	\N	\N	\N
f954632b-21b0-4bf9-b349-904c8ac67ae0	aff743af-2352-4997-93b3-42d8859dfd7e	2026-06-10 13:27:02.572639+00	2026-06-10 14:25:10.972178+00	\N	aal1	\N	2026-06-10 14:25:10.972069	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.228.51	\N	\N	\N	\N	\N
98b307c0-0185-4a31-93cc-4d53b3b51b88	ce8137fb-b064-44ca-b311-8873ed80760f	2026-06-11 05:15:17.421345+00	2026-06-11 05:15:17.421345+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.29.228.136	\N	\N	\N	\N	\N
761b6482-188f-4a1c-8e52-f62c24f63c44	ce8137fb-b064-44ca-b311-8873ed80760f	2026-06-11 05:31:09.382537+00	2026-06-11 05:31:09.382537+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.29.228.136	\N	\N	\N	\N	\N
a824c75c-30d0-4e04-8657-612b3609ff63	4c8744f3-c044-49c3-a42e-97bac2bd7265	2026-06-11 19:52:06.687339+00	2026-06-11 19:52:06.687339+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.27.65.218	\N	\N	\N	\N	\N
2bdd1fb4-e704-4598-9e95-f0ba8d90a63a	a8162597-af98-4abd-92ec-aa4cdee8b760	2026-06-11 20:18:59.889812+00	2026-06-11 20:18:59.889812+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	179.27.65.218	\N	\N	\N	\N	\N
1007edb2-99ed-40e9-95e4-43e32c5c05c8	ce8137fb-b064-44ca-b311-8873ed80760f	2026-06-11 23:30:26.078252+00	2026-06-11 23:30:26.078252+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	179.29.196.78	\N	\N	\N	\N	\N
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
c5075116-9095-4ea4-9024-bd661c22bff6	2026-06-10 22:40:07.882903+00	2026-06-10 22:40:07.882903+00	password	9325b76c-3b85-408a-bad3-1efe97da034c
16046175-7a1f-49ac-8888-207f7355011e	2026-06-10 22:40:46.724607+00	2026-06-10 22:40:46.724607+00	password	ec4a155e-7e77-4058-8997-f859387c1630
fc2f0017-c671-4c14-a066-a8e6a0972118	2026-06-10 22:41:42.659647+00	2026-06-10 22:41:42.659647+00	password	63b9e730-bf8b-4871-a405-1febb26c7505
1648c55b-0e51-4b1b-9e67-a372b1f0f162	2026-06-11 01:37:43.211621+00	2026-06-11 01:37:43.211621+00	password	87dd52c5-cfca-4f7f-8bfc-fec1e843a1de
27da437e-1bde-48ef-b87c-f1ce993be49e	2026-06-11 02:30:54.426673+00	2026-06-11 02:30:54.426673+00	password	7ad96fec-fcce-4c53-bea3-06afc154e826
2d1b090d-8d60-4c65-81e1-b7a419afa072	2026-06-11 02:31:09.100122+00	2026-06-11 02:31:09.100122+00	password	baff368b-7747-4e23-ac7d-9db64d5a4488
9a0eaf9b-a5be-4868-a6f7-425b70843fc1	2026-06-11 04:40:46.883387+00	2026-06-11 04:40:46.883387+00	password	4fc1d5c8-6cb0-4681-bde2-92a0dcf8b1c3
44489017-9a51-4e4a-9d5c-0ed6377cfdfb	2026-06-11 05:13:24.461035+00	2026-06-11 05:13:24.461035+00	password	2c52845b-0711-43c3-a598-78d9183b58ba
98b307c0-0185-4a31-93cc-4d53b3b51b88	2026-06-11 05:15:17.45851+00	2026-06-11 05:15:17.45851+00	password	cb39e86e-ee88-4386-913b-103aebd3aba4
79f80d72-d163-4c57-b985-ae938b4fec29	2026-06-11 05:28:02.528498+00	2026-06-11 05:28:02.528498+00	password	cc954f60-3972-465a-9af6-f275ea659f3a
761b6482-188f-4a1c-8e52-f62c24f63c44	2026-06-11 05:31:09.400406+00	2026-06-11 05:31:09.400406+00	password	d46983d3-e93b-4a56-9ba7-dfae35d9a2c6
4dade114-fd45-486e-a35b-309d5f2e2f87	2026-06-11 19:03:19.190741+00	2026-06-11 19:03:19.190741+00	password	5cbfd0d1-3997-47bb-aa02-a103354564ac
6454ddd2-881b-4238-a336-e4f856f1ffcf	2026-06-11 19:03:41.379243+00	2026-06-11 19:03:41.379243+00	password	de9b0c61-7519-455c-8d9f-ab1b893ad10a
a824c75c-30d0-4e04-8657-612b3609ff63	2026-06-11 19:52:06.756088+00	2026-06-11 19:52:06.756088+00	password	e353fe99-cdd9-4436-9715-20f0a759d783
fd451beb-ee3a-49ed-83bd-4b120201f085	2026-06-11 20:05:52.548762+00	2026-06-11 20:05:52.548762+00	password	70fe6dce-fe8f-4765-9a8b-0fdf5909393e
78b64716-7011-40ac-b8ac-2b3f6addf752	2026-06-11 20:06:52.49075+00	2026-06-11 20:06:52.49075+00	password	e88e8f38-25d6-47a9-8038-959876a2cfad
45bfeb34-29b1-46c4-8340-f7ad6e66b172	2026-06-11 20:07:33.059861+00	2026-06-11 20:07:33.059861+00	password	0f714a46-a0fa-49ca-8e96-26f1067a3d25
802683ee-59e8-4a4d-a0b8-572adc3a57d8	2026-06-11 20:08:19.547934+00	2026-06-11 20:08:19.547934+00	password	ff35c513-4a61-4ca0-9a85-12af8eb2404c
3308cda8-9761-4425-9565-afd722480a8d	2026-06-11 20:09:11.33404+00	2026-06-11 20:09:11.33404+00	password	4a4fb977-eaa7-4fdf-99f5-f811fbfaae38
2bdd1fb4-e704-4598-9e95-f0ba8d90a63a	2026-06-11 20:18:59.91238+00	2026-06-11 20:18:59.91238+00	password	004336eb-52c8-490f-a36a-149ca5620125
931e75eb-98f7-4102-9d47-f7e084de9402	2026-06-11 20:29:24.343144+00	2026-06-11 20:29:24.343144+00	password	60052a5a-58cf-4106-bb09-c8bc6ef21f50
fc3cce87-e5b9-4fd7-b1ee-6538db9ccdab	2026-06-11 20:29:47.119838+00	2026-06-11 20:29:47.119838+00	password	a0641df8-7f06-4b42-a89f-05d16225d54c
ce346ea3-87ef-45aa-80ef-6a3b030e884b	2026-06-11 22:21:02.202591+00	2026-06-11 22:21:02.202591+00	password	8da778d2-4b70-4443-81ae-bfe8a89a37ad
4c67ae53-53d4-4a26-a230-71f78160c581	2026-06-11 22:35:38.550505+00	2026-06-11 22:35:38.550505+00	password	e3767997-8890-4eb7-a4f6-88d4068f7c6f
1007edb2-99ed-40e9-95e4-43e32c5c05c8	2026-06-11 23:30:26.111634+00	2026-06-11 23:30:26.111634+00	password	1352005a-c2d4-4fb1-acf2-884757e68b08
ea5688e6-c7b4-4f24-a8cb-fc62cd4def66	2026-06-11 23:42:30.816132+00	2026-06-11 23:42:30.816132+00	password	0f850e3d-f753-4fc2-a487-5005ab9c21bb
e48601e7-77e3-44c9-a6b8-c84e463acb06	2026-06-11 23:51:34.12317+00	2026-06-11 23:51:34.12317+00	password	35937661-63ef-4796-80d1-d590f2c24ff6
ed637bf4-94bf-4670-81ca-61cf217372bc	2026-06-12 01:32:42.99645+00	2026-06-12 01:32:42.99645+00	password	6a9c9026-2c2a-48d9-addb-b58ea755dfb4
fec34f21-f2fc-4ea1-b9b9-3ff2694272e0	2026-06-12 01:59:23.145244+00	2026-06-12 01:59:23.145244+00	password	f7680bc8-30e3-4b3b-85e2-06ebb7d50b50
d739e867-d2e9-4bfa-a9a2-6473dd78186e	2026-06-12 02:16:25.520899+00	2026-06-12 02:16:25.520899+00	password	c955c92d-0eb9-459e-97a5-7da0c5f71ec5
cc6bff72-9da7-4815-b443-66232c91182f	2026-06-12 02:17:11.678024+00	2026-06-12 02:17:11.678024+00	password	40385835-3713-4978-b0a1-fd2b1d8edc1f
06f5b7e6-ade3-4a43-b2e5-4c0d2dfd0d9c	2026-06-07 02:58:23.42961+00	2026-06-07 02:58:23.42961+00	password	00be0a28-c804-4d5a-9a4a-27806bc8596f
817f6f21-cb30-4d2c-b26a-feecf1bcb727	2026-06-07 02:58:36.323573+00	2026-06-07 02:58:36.323573+00	password	9f68a075-e3fa-4ef9-8aed-24e9d2e5c4ba
8f58698a-b71f-4ddb-9c8a-ce24c58367e1	2026-06-07 03:12:16.322593+00	2026-06-07 03:12:16.322593+00	password	e816c04f-5dd4-4157-8276-e57537645445
31d28656-9187-4182-b18e-8f6950aec3e2	2026-06-07 03:13:30.639462+00	2026-06-07 03:13:30.639462+00	password	8742b6ac-b5af-4f00-b3e1-6235f7e4c1f8
8bdf3833-b0dd-4c1e-9b11-b8fddb835f2d	2026-06-07 05:39:20.694685+00	2026-06-07 05:39:20.694685+00	password	1fc9ab69-c6e3-4a5e-9688-10cf78793f2c
3d306f7f-9ce1-4667-90ad-31618a11a10e	2026-06-07 06:47:40.268476+00	2026-06-07 06:47:40.268476+00	password	99e35e9a-ce72-4262-8b3d-6b598b7c3d80
b4119b14-52f4-401d-b8bd-3960340f71a5	2026-06-07 06:48:00.598404+00	2026-06-07 06:48:00.598404+00	password	c5565b15-3b9e-4052-8471-2e09e7c45a35
e7bc19c1-bd1e-4580-b2be-5c4688d4b375	2026-06-07 17:15:59.291196+00	2026-06-07 17:15:59.291196+00	password	abe4b024-899b-435a-882e-6f390e22e463
1719ee25-714d-42e2-bd58-3d23fd064f7c	2026-06-07 20:51:53.068148+00	2026-06-07 20:51:53.068148+00	password	394013ca-62cc-46da-bc75-2a80dbd677ae
f954632b-21b0-4bf9-b349-904c8ac67ae0	2026-06-10 13:27:02.575441+00	2026-06-10 13:27:02.575441+00	password	92e02e30-5bd3-4400-8f81-15943e7486d1
3818907c-b794-49c0-9343-69be6954cd69	2026-06-10 14:39:33.558093+00	2026-06-10 14:39:33.558093+00	password	2a6ef534-4c7c-4a1c-91d6-8d76ddf22f40
bf352a7b-8c1a-4101-befe-a3db64361f53	2026-06-10 14:51:30.731698+00	2026-06-10 14:51:30.731698+00	password	05dc09e1-32c2-467a-8c05-a0ffe1c5b649
edf7d167-8ef5-4fda-af6d-e2477b1ba75b	2026-06-10 15:25:34.930729+00	2026-06-10 15:25:34.930729+00	password	700360bc-af60-4217-a089-e7f74cf0aba6
e688fc21-c313-4b51-b26a-1e274bcf2651	2026-06-10 16:15:47.80023+00	2026-06-10 16:15:47.80023+00	password	a87d9c25-439b-42e7-a03b-34ce544a052e
8552de5c-d83e-4db4-aba1-cd81ed0d526d	2026-06-10 16:54:32.210442+00	2026-06-10 16:54:32.210442+00	password	6c1733b9-1d46-4679-9e9d-12787435a19a
7a1c76ba-7ddf-4c8d-898a-6f3dbc6c29d8	2026-06-10 19:19:03.278303+00	2026-06-10 19:19:03.278303+00	password	5f0f3b09-04b5-42a1-be03-c3f4a93d2107
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	145	mnbahbiixivs	a8162597-af98-4abd-92ec-aa4cdee8b760	t	2026-06-11 03:30:18.829366+00	2026-06-11 04:28:21.326384+00	jrfk5jqghjq5	27da437e-1bde-48ef-b87c-f1ce993be49e
00000000-0000-0000-0000-000000000000	53	3erswbivawox	aff743af-2352-4997-93b3-42d8859dfd7e	t	2026-06-07 05:39:20.690847+00	2026-06-07 06:44:35.104384+00	\N	8bdf3833-b0dd-4c1e-9b11-b8fddb835f2d
00000000-0000-0000-0000-000000000000	58	7idua42rfs6b	aff743af-2352-4997-93b3-42d8859dfd7e	f	2026-06-07 06:44:35.115354+00	2026-06-07 06:44:35.115354+00	3erswbivawox	8bdf3833-b0dd-4c1e-9b11-b8fddb835f2d
00000000-0000-0000-0000-000000000000	147	4zsxn2oncxkm	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-11 04:28:21.337379+00	2026-06-11 04:28:21.337379+00	mnbahbiixivs	27da437e-1bde-48ef-b87c-f1ce993be49e
00000000-0000-0000-0000-000000000000	60	eg27gf7hh6eg	aff743af-2352-4997-93b3-42d8859dfd7e	f	2026-06-07 06:47:40.263442+00	2026-06-07 06:47:40.263442+00	\N	3d306f7f-9ce1-4667-90ad-31618a11a10e
00000000-0000-0000-0000-000000000000	61	zq7xb6ivylpj	4c8744f3-c044-49c3-a42e-97bac2bd7265	f	2026-06-07 06:48:00.597022+00	2026-06-07 06:48:00.597022+00	\N	b4119b14-52f4-401d-b8bd-3960340f71a5
00000000-0000-0000-0000-000000000000	146	qz433nxei7qx	ce8137fb-b064-44ca-b311-8873ed80760f	t	2026-06-11 03:30:22.030006+00	2026-06-11 04:28:26.773473+00	msij6jgqscgk	2d1b090d-8d60-4c65-81e1-b7a419afa072
00000000-0000-0000-0000-000000000000	148	wtlwwmsm3276	ce8137fb-b064-44ca-b311-8873ed80760f	f	2026-06-11 04:28:26.773883+00	2026-06-11 04:28:26.773883+00	qz433nxei7qx	2d1b090d-8d60-4c65-81e1-b7a419afa072
00000000-0000-0000-0000-000000000000	150	jkmrliuxp47u	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-11 05:13:24.428936+00	2026-06-11 05:13:24.428936+00	\N	44489017-9a51-4e4a-9d5c-0ed6377cfdfb
00000000-0000-0000-0000-000000000000	136	vg64zv2eknec	4c8744f3-c044-49c3-a42e-97bac2bd7265	f	2026-06-10 22:40:46.722449+00	2026-06-10 22:40:46.722449+00	\N	16046175-7a1f-49ac-8888-207f7355011e
00000000-0000-0000-0000-000000000000	137	xocqgia72bn3	e4952765-2fcf-44b7-8821-13c99353b5e9	f	2026-06-10 22:41:42.657484+00	2026-06-10 22:41:42.657484+00	\N	fc2f0017-c671-4c14-a066-a8e6a0972118
00000000-0000-0000-0000-000000000000	154	rr65yr5zoklf	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-11 19:03:19.163578+00	2026-06-11 19:03:19.163578+00	\N	4dade114-fd45-486e-a35b-309d5f2e2f87
00000000-0000-0000-0000-000000000000	155	w4ku7c75fq7v	aff743af-2352-4997-93b3-42d8859dfd7e	f	2026-06-11 19:03:41.377855+00	2026-06-11 19:03:41.377855+00	\N	6454ddd2-881b-4238-a336-e4f856f1ffcf
00000000-0000-0000-0000-000000000000	157	p2dhyoeiocvs	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-11 20:05:52.531784+00	2026-06-11 20:05:52.531784+00	\N	fd451beb-ee3a-49ed-83bd-4b120201f085
00000000-0000-0000-0000-000000000000	158	6hj3d2wng6tj	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-11 20:06:52.489364+00	2026-06-11 20:06:52.489364+00	\N	78b64716-7011-40ac-b8ac-2b3f6addf752
00000000-0000-0000-0000-000000000000	159	pnqkzxtvbdii	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-11 20:07:33.048995+00	2026-06-11 20:07:33.048995+00	\N	45bfeb34-29b1-46c4-8340-f7ad6e66b172
00000000-0000-0000-0000-000000000000	160	yfn3fu2o6okw	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-11 20:08:19.546539+00	2026-06-11 20:08:19.546539+00	\N	802683ee-59e8-4a4d-a0b8-572adc3a57d8
00000000-0000-0000-0000-000000000000	68	mkozqoftick2	aff743af-2352-4997-93b3-42d8859dfd7e	t	2026-06-07 17:15:59.270828+00	2026-06-07 18:23:04.832439+00	\N	e7bc19c1-bd1e-4580-b2be-5c4688d4b375
00000000-0000-0000-0000-000000000000	71	6dlxkofkqzgq	aff743af-2352-4997-93b3-42d8859dfd7e	f	2026-06-07 18:23:04.841917+00	2026-06-07 18:23:04.841917+00	mkozqoftick2	e7bc19c1-bd1e-4580-b2be-5c4688d4b375
00000000-0000-0000-0000-000000000000	161	w43x4uzudjat	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-11 20:09:11.332675+00	2026-06-11 20:09:11.332675+00	\N	3308cda8-9761-4425-9565-afd722480a8d
00000000-0000-0000-0000-000000000000	163	u7fjmumfey3z	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-11 20:29:24.337442+00	2026-06-11 20:29:24.337442+00	\N	931e75eb-98f7-4102-9d47-f7e084de9402
00000000-0000-0000-0000-000000000000	164	cr6ibqsbrn7m	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-11 20:29:47.118582+00	2026-06-11 20:29:47.118582+00	\N	fc3cce87-e5b9-4fd7-b1ee-6538db9ccdab
00000000-0000-0000-0000-000000000000	152	wt2j4pardoky	a8162597-af98-4abd-92ec-aa4cdee8b760	t	2026-06-11 05:28:02.500215+00	2026-06-11 23:29:30.675125+00	\N	79f80d72-d163-4c57-b985-ae938b4fec29
00000000-0000-0000-0000-000000000000	169	vgwef5oprkxv	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-11 23:31:53.472881+00	2026-06-11 23:31:53.472881+00	klduv2ss4ozy	ce346ea3-87ef-45aa-80ef-6a3b030e884b
00000000-0000-0000-0000-000000000000	166	a3lplxabkdfp	4c8744f3-c044-49c3-a42e-97bac2bd7265	t	2026-06-11 22:35:38.536172+00	2026-06-11 23:41:47.282115+00	\N	4c67ae53-53d4-4a26-a230-71f78160c581
00000000-0000-0000-0000-000000000000	172	tcys4tr23cjs	ce8137fb-b064-44ca-b311-8873ed80760f	t	2026-06-11 23:51:34.113359+00	2026-06-12 01:33:03.760819+00	\N	e48601e7-77e3-44c9-a6b8-c84e463acb06
00000000-0000-0000-0000-000000000000	178	kzh2fomtixxy	ce8137fb-b064-44ca-b311-8873ed80760f	f	2026-06-12 01:59:23.117262+00	2026-06-12 01:59:23.117262+00	\N	fec34f21-f2fc-4ea1-b9b9-3ff2694272e0
00000000-0000-0000-0000-000000000000	174	bzp67rk2dqiz	a8162597-af98-4abd-92ec-aa4cdee8b760	t	2026-06-12 01:02:37.925754+00	2026-06-12 02:01:14.087337+00	safgolzmtlrt	79f80d72-d163-4c57-b985-ae938b4fec29
00000000-0000-0000-0000-000000000000	180	nlqjhj3y5ljr	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-12 02:16:25.501536+00	2026-06-12 02:16:25.501536+00	\N	d739e867-d2e9-4bfa-a9a2-6473dd78186e
00000000-0000-0000-0000-000000000000	181	nxqxucjxlwb6	4c8744f3-c044-49c3-a42e-97bac2bd7265	f	2026-06-12 02:17:11.676717+00	2026-06-12 02:17:11.676717+00	\N	cc6bff72-9da7-4815-b443-66232c91182f
00000000-0000-0000-0000-000000000000	38	6gz4mgbxehno	4c8744f3-c044-49c3-a42e-97bac2bd7265	f	2026-06-07 02:58:23.410324+00	2026-06-07 02:58:23.410324+00	\N	06f5b7e6-ade3-4a43-b2e5-4c0d2dfd0d9c
00000000-0000-0000-0000-000000000000	39	tmou4jijknrh	4c8744f3-c044-49c3-a42e-97bac2bd7265	f	2026-06-07 02:58:36.321453+00	2026-06-07 02:58:36.321453+00	\N	817f6f21-cb30-4d2c-b26a-feecf1bcb727
00000000-0000-0000-0000-000000000000	78	lds3pvpd2fbf	aff743af-2352-4997-93b3-42d8859dfd7e	t	2026-06-07 20:51:53.056887+00	2026-06-08 00:30:17.917764+00	\N	1719ee25-714d-42e2-bd58-3d23fd064f7c
00000000-0000-0000-0000-000000000000	44	qwrpyvugdpho	4c8744f3-c044-49c3-a42e-97bac2bd7265	f	2026-06-07 03:12:16.315776+00	2026-06-07 03:12:16.315776+00	\N	8f58698a-b71f-4ddb-9c8a-ce24c58367e1
00000000-0000-0000-0000-000000000000	83	4hmmcbyet37n	aff743af-2352-4997-93b3-42d8859dfd7e	f	2026-06-08 00:30:17.924135+00	2026-06-08 00:30:17.924135+00	lds3pvpd2fbf	1719ee25-714d-42e2-bd58-3d23fd064f7c
00000000-0000-0000-0000-000000000000	46	urfmp6fongx6	aff743af-2352-4997-93b3-42d8859dfd7e	f	2026-06-07 03:13:30.637981+00	2026-06-07 03:13:30.637981+00	\N	31d28656-9187-4182-b18e-8f6950aec3e2
00000000-0000-0000-0000-000000000000	101	w7jpshp4sqeb	aff743af-2352-4997-93b3-42d8859dfd7e	t	2026-06-10 13:27:02.573981+00	2026-06-10 14:25:10.942238+00	\N	f954632b-21b0-4bf9-b349-904c8ac67ae0
00000000-0000-0000-0000-000000000000	102	jgv7aeg2c7zg	aff743af-2352-4997-93b3-42d8859dfd7e	f	2026-06-10 14:25:10.952635+00	2026-06-10 14:25:10.952635+00	w7jpshp4sqeb	f954632b-21b0-4bf9-b349-904c8ac67ae0
00000000-0000-0000-0000-000000000000	106	focbwmhn5tau	aff743af-2352-4997-93b3-42d8859dfd7e	f	2026-06-10 14:39:33.555521+00	2026-06-10 14:39:33.555521+00	\N	3818907c-b794-49c0-9343-69be6954cd69
00000000-0000-0000-0000-000000000000	108	4arpiweatfgl	aff743af-2352-4997-93b3-42d8859dfd7e	f	2026-06-10 14:51:30.7253+00	2026-06-10 14:51:30.7253+00	\N	bf352a7b-8c1a-4101-befe-a3db64361f53
00000000-0000-0000-0000-000000000000	112	mn5lo5sgskqz	aff743af-2352-4997-93b3-42d8859dfd7e	f	2026-06-10 15:25:34.926323+00	2026-06-10 15:25:34.926323+00	\N	edf7d167-8ef5-4fda-af6d-e2477b1ba75b
00000000-0000-0000-0000-000000000000	114	ysn7rpdnh3up	4c8744f3-c044-49c3-a42e-97bac2bd7265	f	2026-06-10 16:15:47.796226+00	2026-06-10 16:15:47.796226+00	\N	e688fc21-c313-4b51-b26a-1e274bcf2651
00000000-0000-0000-0000-000000000000	118	rls3v645h5kr	4c8744f3-c044-49c3-a42e-97bac2bd7265	f	2026-06-10 16:54:32.178857+00	2026-06-10 16:54:32.178857+00	\N	8552de5c-d83e-4db4-aba1-cd81ed0d526d
00000000-0000-0000-0000-000000000000	149	jx44gktfqy3m	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-11 04:40:46.86847+00	2026-06-11 04:40:46.86847+00	\N	9a0eaf9b-a5be-4868-a6f7-425b70843fc1
00000000-0000-0000-0000-000000000000	151	cth5wbq3qejp	ce8137fb-b064-44ca-b311-8873ed80760f	f	2026-06-11 05:15:17.444481+00	2026-06-11 05:15:17.444481+00	\N	98b307c0-0185-4a31-93cc-4d53b3b51b88
00000000-0000-0000-0000-000000000000	153	2fizovzpg4ky	ce8137fb-b064-44ca-b311-8873ed80760f	f	2026-06-11 05:31:09.393616+00	2026-06-11 05:31:09.393616+00	\N	761b6482-188f-4a1c-8e52-f62c24f63c44
00000000-0000-0000-0000-000000000000	156	bwfzdkh4h753	4c8744f3-c044-49c3-a42e-97bac2bd7265	f	2026-06-11 19:52:06.718345+00	2026-06-11 19:52:06.718345+00	\N	a824c75c-30d0-4e04-8657-612b3609ff63
00000000-0000-0000-0000-000000000000	162	e4uxxf2s4a4o	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-11 20:18:59.901856+00	2026-06-11 20:18:59.901856+00	\N	2bdd1fb4-e704-4598-9e95-f0ba8d90a63a
00000000-0000-0000-0000-000000000000	122	erwzqwxgykdn	aff743af-2352-4997-93b3-42d8859dfd7e	t	2026-06-10 19:19:03.276343+00	2026-06-10 20:29:28.361547+00	\N	7a1c76ba-7ddf-4c8d-898a-6f3dbc6c29d8
00000000-0000-0000-0000-000000000000	124	avoo7klfegga	aff743af-2352-4997-93b3-42d8859dfd7e	f	2026-06-10 20:29:28.368326+00	2026-06-10 20:29:28.368326+00	erwzqwxgykdn	7a1c76ba-7ddf-4c8d-898a-6f3dbc6c29d8
00000000-0000-0000-0000-000000000000	168	h2ctsma5sqco	ce8137fb-b064-44ca-b311-8873ed80760f	f	2026-06-11 23:30:26.105948+00	2026-06-11 23:30:26.105948+00	\N	1007edb2-99ed-40e9-95e4-43e32c5c05c8
00000000-0000-0000-0000-000000000000	165	klduv2ss4ozy	a8162597-af98-4abd-92ec-aa4cdee8b760	t	2026-06-11 22:21:02.171795+00	2026-06-11 23:31:53.466886+00	\N	ce346ea3-87ef-45aa-80ef-6a3b030e884b
00000000-0000-0000-0000-000000000000	170	34ofyo3owwxp	4c8744f3-c044-49c3-a42e-97bac2bd7265	t	2026-06-11 23:41:47.295569+00	2026-06-12 00:43:42.233399+00	a3lplxabkdfp	4c67ae53-53d4-4a26-a230-71f78160c581
00000000-0000-0000-0000-000000000000	173	ly5sgye4tr7p	4c8744f3-c044-49c3-a42e-97bac2bd7265	f	2026-06-12 00:43:42.2451+00	2026-06-12 00:43:42.2451+00	34ofyo3owwxp	4c67ae53-53d4-4a26-a230-71f78160c581
00000000-0000-0000-0000-000000000000	167	safgolzmtlrt	a8162597-af98-4abd-92ec-aa4cdee8b760	t	2026-06-11 23:29:30.694349+00	2026-06-12 01:02:37.914819+00	wt2j4pardoky	79f80d72-d163-4c57-b985-ae938b4fec29
00000000-0000-0000-0000-000000000000	171	2szz74dktphc	a8162597-af98-4abd-92ec-aa4cdee8b760	t	2026-06-11 23:42:30.8094+00	2026-06-12 01:31:55.992374+00	\N	ea5688e6-c7b4-4f24-a8cb-fc62cd4def66
00000000-0000-0000-0000-000000000000	135	zme66aoreseg	aff743af-2352-4997-93b3-42d8859dfd7e	f	2026-06-10 22:40:07.880665+00	2026-06-10 22:40:07.880665+00	\N	c5075116-9095-4ea4-9024-bd661c22bff6
00000000-0000-0000-0000-000000000000	175	6oeujyvjzge5	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-12 01:31:56.005968+00	2026-06-12 01:31:56.005968+00	2szz74dktphc	ea5688e6-c7b4-4f24-a8cb-fc62cd4def66
00000000-0000-0000-0000-000000000000	140	veuknusjnduq	ce8137fb-b064-44ca-b311-8873ed80760f	f	2026-06-11 01:37:43.20646+00	2026-06-11 01:37:43.20646+00	\N	1648c55b-0e51-4b1b-9e67-a372b1f0f162
00000000-0000-0000-0000-000000000000	176	yjhph7k6g2ca	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-12 01:32:42.986019+00	2026-06-12 01:32:42.986019+00	\N	ed637bf4-94bf-4670-81ca-61cf217372bc
00000000-0000-0000-0000-000000000000	177	hmpuqp3duowo	ce8137fb-b064-44ca-b311-8873ed80760f	f	2026-06-12 01:33:03.763679+00	2026-06-12 01:33:03.763679+00	tcys4tr23cjs	e48601e7-77e3-44c9-a6b8-c84e463acb06
00000000-0000-0000-0000-000000000000	179	5p7oesv4wrk2	a8162597-af98-4abd-92ec-aa4cdee8b760	t	2026-06-12 02:01:14.093515+00	2026-06-12 16:52:33.202431+00	bzp67rk2dqiz	79f80d72-d163-4c57-b985-ae938b4fec29
00000000-0000-0000-0000-000000000000	182	ms55qjif7zwx	a8162597-af98-4abd-92ec-aa4cdee8b760	f	2026-06-12 16:52:33.217309+00	2026-06-12 16:52:33.217309+00	5p7oesv4wrk2	79f80d72-d163-4c57-b985-ae938b4fec29
00000000-0000-0000-0000-000000000000	143	jrfk5jqghjq5	a8162597-af98-4abd-92ec-aa4cdee8b760	t	2026-06-11 02:30:54.404396+00	2026-06-11 03:30:18.804314+00	\N	27da437e-1bde-48ef-b87c-f1ce993be49e
00000000-0000-0000-0000-000000000000	144	msij6jgqscgk	ce8137fb-b064-44ca-b311-8873ed80760f	t	2026-06-11 02:31:09.098732+00	2026-06-11 03:30:22.024789+00	\N	2d1b090d-8d60-4c65-81e1-b7a419afa072
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: job; Type: TABLE DATA; Schema: cron; Owner: supabase_admin
--

COPY cron.job (jobid, schedule, command, nodename, nodeport, database, username, active, jobname) FROM stdin;
1	*/30 * * * *	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	localhost	5432	postgres	postgres	t	cerrar-sesiones-inactivas
\.


--
-- Data for Name: job_run_details; Type: TABLE DATA; Schema: cron; Owner: supabase_admin
--

COPY cron.job_run_details (jobid, runid, job_pid, database, username, command, status, return_message, start_time, end_time) FROM stdin;
1	27	62759	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 13:00:00.101572+00	2026-06-07 13:00:00.105925+00
1	21	54232	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 10:00:00.078135+00	2026-06-07 10:00:00.080159+00
1	7	31835	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 03:00:00.16409+00	2026-06-07 03:00:00.16541+00
1	1	21487	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 00:00:00.229009+00	2026-06-07 00:00:00.23137+00
1	12	39842	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 05:30:00.158638+00	2026-06-07 05:30:00.162999+00
1	2	23248	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 00:30:00.173076+00	2026-06-07 00:30:00.175189+00
1	8	33612	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 03:30:00.17347+00	2026-06-07 03:30:00.174973+00
1	3	24983	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 01:00:00.247195+00	2026-06-07 01:00:00.251684+00
1	16	46856	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 07:30:00.151563+00	2026-06-07 07:30:00.154014+00
1	13	41634	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 06:00:00.147866+00	2026-06-07 06:00:00.14913+00
1	4	26562	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 3	2026-06-07 01:30:00.260997+00	2026-06-07 01:30:00.269005+00
1	9	35189	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 04:00:00.18161+00	2026-06-07 04:00:00.183917+00
1	5	28270	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 02:00:00.160777+00	2026-06-07 02:00:00.161566+00
1	19	51316	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 1	2026-06-07 09:00:00.107721+00	2026-06-07 09:00:00.113987+00
1	10	36606	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 4	2026-06-07 04:30:00.168932+00	2026-06-07 04:30:00.198411+00
1	6	30048	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 02:30:00.17228+00	2026-06-07 02:30:00.173686+00
1	23	57074	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 11:00:00.075377+00	2026-06-07 11:00:00.07753+00
1	14	43471	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 06:30:00.163506+00	2026-06-07 06:30:00.165456+00
1	17	48410	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 2	2026-06-07 08:00:00.162286+00	2026-06-07 08:00:00.167291+00
1	11	38099	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 05:00:00.151163+00	2026-06-07 05:00:00.15531+00
1	15	45142	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 07:00:00.179368+00	2026-06-07 07:00:00.180936+00
1	20	52808	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 09:30:00.186106+00	2026-06-07 09:30:00.18755+00
1	18	49873	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 08:30:00.171101+00	2026-06-07 08:30:00.175249+00
1	22	55658	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 10:30:00.078185+00	2026-06-07 10:30:00.080177+00
1	26	61340	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 12:30:00.082196+00	2026-06-07 12:30:00.085073+00
1	25	59916	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 12:00:00.087164+00	2026-06-07 12:00:00.090275+00
1	24	58495	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 11:30:00.083705+00	2026-06-07 11:30:00.087442+00
1	28	64182	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 13:30:00.085849+00	2026-06-07 13:30:00.087946+00
1	29	65603	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 14:00:00.081403+00	2026-06-07 14:00:00.084319+00
1	30	67608	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 14:30:00.093516+00	2026-06-07 14:30:00.095499+00
1	31	69019	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 15:00:00.098494+00	2026-06-07 15:00:00.102517+00
1	32	70454	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 15:30:00.084075+00	2026-06-07 15:30:00.086372+00
1	47	93598	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 23:00:00.08416+00	2026-06-07 23:00:00.087896+00
1	50	97943	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 00:30:00.180768+00	2026-06-08 00:30:00.184143+00
1	33	71892	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 16:00:00.069443+00	2026-06-07 16:00:00.071034+00
1	39	81668	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 1	2026-06-07 19:00:00.162336+00	2026-06-07 19:00:00.169535+00
1	44	89355	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 21:30:00.18823+00	2026-06-07 21:30:00.19148+00
1	34	73526	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 16:30:00.17495+00	2026-06-07 16:30:00.177297+00
1	40	83175	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 19:30:00.168462+00	2026-06-07 19:30:00.171599+00
1	35	75105	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 17:00:00.159322+00	2026-06-07 17:00:00.160731+00
1	57	108426	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 04:00:00.090022+00	2026-06-08 04:00:00.093476+00
1	48	95039	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 23:30:00.085925+00	2026-06-07 23:30:00.089439+00
1	36	76759	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 17:30:00.180691+00	2026-06-07 17:30:00.182231+00
1	45	90767	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 2	2026-06-07 22:00:00.099381+00	2026-06-07 22:00:00.104937+00
1	41	84628	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 20:00:00.169595+00	2026-06-07 20:00:00.171828+00
1	37	78452	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 18:00:00.179625+00	2026-06-07 18:00:00.183619+00
1	56	107020	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 03:30:00.085804+00	2026-06-08 03:30:00.092073+00
1	38	80103	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 1	2026-06-07 18:30:00.185285+00	2026-06-07 18:30:00.18889+00
1	42	86145	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 20:30:00.175816+00	2026-06-07 20:30:00.178391+00
1	46	92189	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 22:30:00.108238+00	2026-06-07 22:30:00.110843+00
1	43	87765	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-07 21:00:00.170358+00	2026-06-07 21:00:00.171845+00
1	51	99488	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 01:00:00.18749+00	2026-06-08 01:00:00.192044+00
1	49	96454	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 00:00:00.091654+00	2026-06-08 00:00:00.095689+00
1	53	102787	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 02:00:00.090809+00	2026-06-08 02:00:00.09453+00
1	55	105604	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 03:00:00.081641+00	2026-06-08 03:00:00.085405+00
1	52	100930	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 01:30:00.183225+00	2026-06-08 01:30:00.188441+00
1	54	104197	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 02:30:00.092984+00	2026-06-08 02:30:00.095964+00
1	60	112654	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 05:30:00.08865+00	2026-06-08 05:30:00.090859+00
1	58	109836	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 04:30:00.074195+00	2026-06-08 04:30:00.076358+00
1	59	111249	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 05:00:00.089663+00	2026-06-08 05:00:00.091788+00
1	61	114061	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 06:00:00.083819+00	2026-06-08 06:00:00.085964+00
1	62	117926	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 06:30:00.150124+00	2026-06-08 06:30:00.154139+00
1	63	119352	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 07:00:00.109556+00	2026-06-08 07:00:00.113362+00
1	64	120764	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 07:30:00.086396+00	2026-06-08 07:30:00.089436+00
1	79	142215	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 15:00:00.068628+00	2026-06-08 15:00:00.070753+00
1	82	146628	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 16:30:00.087135+00	2026-06-08 16:30:00.090262+00
1	65	122171	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 08:00:00.068657+00	2026-06-08 08:00:00.071529+00
1	71	130638	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 11:00:00.077711+00	2026-06-08 11:00:00.081916+00
1	76	137676	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 13:30:00.082293+00	2026-06-08 13:30:00.086197+00
1	66	123582	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 08:30:00.080749+00	2026-06-08 08:30:00.084149+00
1	72	132043	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 11:30:00.078666+00	2026-06-08 11:30:00.080616+00
1	67	124994	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 09:00:00.088944+00	2026-06-08 09:00:00.092481+00
1	89	157182	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 20:00:00.092062+00	2026-06-08 20:00:00.094391+00
1	80	143654	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 15:30:00.081866+00	2026-06-08 15:30:00.083981+00
1	68	126407	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 09:30:00.097595+00	2026-06-08 09:30:00.099763+00
1	77	139127	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 14:00:00.17258+00	2026-06-08 14:00:00.175588+00
1	73	133446	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 12:00:00.08299+00	2026-06-08 12:00:00.085075+00
1	69	127817	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 10:00:00.07345+00	2026-06-08 10:00:00.075704+00
1	88	155682	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 19:30:00.077437+00	2026-06-08 19:30:00.080457+00
1	70	129225	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 10:30:00.076431+00	2026-06-08 10:30:00.078534+00
1	74	134858	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 12:30:00.106607+00	2026-06-08 12:30:00.108973+00
1	78	140806	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 14:30:00.11273+00	2026-06-08 14:30:00.115699+00
1	75	136267	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 13:00:00.085413+00	2026-06-08 13:00:00.087391+00
1	83	148129	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 17:00:00.109025+00	2026-06-08 17:00:00.112454+00
1	81	145064	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 16:00:00.092641+00	2026-06-08 16:00:00.095861+00
1	85	151142	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 18:00:00.112619+00	2026-06-08 18:00:00.115756+00
1	87	154172	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 19:00:00.072699+00	2026-06-08 19:00:00.074935+00
1	84	149635	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 17:30:00.077402+00	2026-06-08 17:30:00.079532+00
1	86	152659	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 18:30:00.105036+00	2026-06-08 18:30:00.108795+00
1	92	161694	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 21:30:00.07988+00	2026-06-08 21:30:00.08331+00
1	90	158692	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 20:30:00.080434+00	2026-06-08 20:30:00.083443+00
1	91	160192	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 21:00:00.097634+00	2026-06-08 21:00:00.099799+00
1	93	163197	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 22:00:00.085224+00	2026-06-08 22:00:00.087348+00
1	94	164701	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 22:30:00.098236+00	2026-06-08 22:30:00.10097+00
1	95	166205	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 23:00:00.070973+00	2026-06-08 23:00:00.073331+00
1	96	167705	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-08 23:30:00.097186+00	2026-06-08 23:30:00.100513+00
1	111	190601	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 07:00:00.08643+00	2026-06-09 07:00:00.089622+00
1	114	195106	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 08:30:00.094384+00	2026-06-09 08:30:00.097444+00
1	97	169301	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 00:00:00.075515+00	2026-06-09 00:00:00.078789+00
1	103	178422	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 03:00:00.092878+00	2026-06-09 03:00:00.095419+00
1	108	185932	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 05:30:00.092301+00	2026-06-09 05:30:00.094806+00
1	98	170880	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 00:30:00.089372+00	2026-06-09 00:30:00.091609+00
1	104	179920	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 03:30:00.094338+00	2026-06-09 03:30:00.098245+00
1	99	172406	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 01:00:00.068948+00	2026-06-09 01:00:00.07177+00
1	121	205640	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 12:00:00.10928+00	2026-06-09 12:00:00.111645+00
1	112	192104	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 07:30:00.079809+00	2026-06-09 07:30:00.082881+00
1	100	173912	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 01:30:00.121703+00	2026-06-09 01:30:00.126828+00
1	109	187439	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 06:00:00.103178+00	2026-06-09 06:00:00.105406+00
1	105	181423	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 04:00:00.083967+00	2026-06-09 04:00:00.086196+00
1	101	175414	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 02:00:00.085417+00	2026-06-09 02:00:00.088706+00
1	120	204128	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 11:30:00.096148+00	2026-06-09 11:30:00.098581+00
1	102	176922	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 02:30:00.090373+00	2026-06-09 02:30:00.093271+00
1	106	182929	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 04:30:00.092892+00	2026-06-09 04:30:00.099272+00
1	110	189077	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 06:30:00.083137+00	2026-06-09 06:30:00.085189+00
1	107	184434	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 05:00:00.089904+00	2026-06-09 05:00:00.092208+00
1	115	196602	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 09:00:00.102132+00	2026-06-09 09:00:00.105379+00
1	113	193602	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 08:00:00.094256+00	2026-06-09 08:00:00.099272+00
1	117	199612	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 10:00:00.076341+00	2026-06-09 10:00:00.080278+00
1	119	202624	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 11:00:00.094381+00	2026-06-09 11:00:00.09738+00
1	116	198111	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 09:30:00.082314+00	2026-06-09 09:30:00.086278+00
1	118	201120	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 10:30:00.102924+00	2026-06-09 10:30:00.110495+00
1	124	210392	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 13:30:00.105548+00	2026-06-09 13:30:00.107911+00
1	122	207141	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 12:30:00.086368+00	2026-06-09 12:30:00.08985+00
1	123	208645	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 13:00:00.082236+00	2026-06-09 13:00:00.084422+00
1	125	211898	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 14:00:00.092684+00	2026-06-09 14:00:00.097214+00
1	126	213559	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 14:30:00.152708+00	2026-06-09 14:30:00.155494+00
1	127	215076	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 15:00:00.102626+00	2026-06-09 15:00:00.106206+00
1	128	216721	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 15:30:00.128136+00	2026-06-09 15:30:00.131087+00
1	143	239490	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 23:00:00.089186+00	2026-06-09 23:00:00.092341+00
1	146	244303	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 00:30:00.166461+00	2026-06-10 00:30:00.168884+00
1	129	218242	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 16:00:00.09374+00	2026-06-09 16:00:00.097435+00
1	135	227375	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 19:00:00.0924+00	2026-06-09 19:00:00.095525+00
1	140	234952	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 21:30:00.08091+00	2026-06-09 21:30:00.083308+00
1	130	219770	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 16:30:00.08743+00	2026-06-09 16:30:00.091175+00
1	136	228892	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 19:30:00.090924+00	2026-06-09 19:30:00.093836+00
1	131	221288	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 17:00:00.088102+00	2026-06-09 17:00:00.090276+00
1	144	241040	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 23:30:00.073103+00	2026-06-09 23:30:00.075215+00
1	132	222805	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 17:30:00.106209+00	2026-06-09 17:30:00.108456+00
1	141	236463	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 22:00:00.082716+00	2026-06-09 22:00:00.085466+00
1	137	230403	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 20:00:00.083996+00	2026-06-09 20:00:00.086124+00
1	133	224315	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 18:00:00.09591+00	2026-06-09 18:00:00.099558+00
1	152	253458	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 03:30:00.107487+00	2026-06-10 03:30:00.109796+00
1	134	225850	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 18:30:00.10726+00	2026-06-09 18:30:00.109547+00
1	138	231921	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 20:30:00.111852+00	2026-06-09 20:30:00.115447+00
1	142	237977	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 22:30:00.089693+00	2026-06-09 22:30:00.09262+00
1	139	233435	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-09 21:00:00.087185+00	2026-06-09 21:00:00.090029+00
1	147	245833	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 1	2026-06-10 01:00:00.075917+00	2026-06-10 01:00:00.079761+00
1	145	242741	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 00:00:00.203888+00	2026-06-10 00:00:00.209188+00
1	149	248917	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 02:00:00.099549+00	2026-06-10 02:00:00.102603+00
1	151	251938	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 03:00:00.073663+00	2026-06-10 03:00:00.076613+00
1	148	247380	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 01:30:00.100835+00	2026-06-10 01:30:00.102965+00
1	153	255179	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 04:00:00.208326+00	2026-06-10 04:00:00.213086+00
1	150	250429	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 02:30:00.085227+00	2026-06-10 02:30:00.090677+00
1	156	260687	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 05:30:00.19714+00	2026-06-10 05:30:00.200881+00
1	155	258986	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 05:00:00.159401+00	2026-06-10 05:00:00.163683+00
1	154	257287	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 04:30:00.173174+00	2026-06-10 04:30:00.174603+00
1	157	262424	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 06:00:00.163896+00	2026-06-10 06:00:00.169185+00
1	158	266382	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 06:30:00.188156+00	2026-06-10 06:30:00.192915+00
1	159	268224	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 07:00:00.195222+00	2026-06-10 07:00:00.199383+00
1	174	292078	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 1	2026-06-10 14:30:00.166739+00	2026-06-10 14:30:00.168802+00
1	177	297360	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 1	2026-06-10 16:00:00.197668+00	2026-06-10 16:00:00.199936+00
1	160	270163	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 07:30:00.195825+00	2026-06-10 07:30:00.198171+00
1	166	279401	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 10:30:00.076146+00	2026-06-10 10:30:00.078874+00
1	171	286967	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 13:00:00.133413+00	2026-06-10 13:00:00.136198+00
1	161	271821	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 08:00:00.193874+00	2026-06-10 08:00:00.201674+00
1	167	280921	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 11:00:00.147735+00	2026-06-10 11:00:00.151172+00
1	162	273337	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 1	2026-06-10 08:30:00.106404+00	2026-06-10 08:30:00.111226+00
1	184	308966	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 19:30:00.172364+00	2026-06-10 19:30:00.173979+00
1	175	293843	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 15:00:00.189089+00	2026-06-10 15:00:00.190128+00
1	163	274849	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 09:00:00.069044+00	2026-06-10 09:00:00.073235+00
1	172	288526	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 13:30:00.078364+00	2026-06-10 13:30:00.079713+00
1	168	282427	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 11:30:00.077883+00	2026-06-10 11:30:00.080284+00
1	164	276375	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 09:30:00.06832+00	2026-06-10 09:30:00.071689+00
1	183	307337	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 19:00:00.109064+00	2026-06-10 19:00:00.112904+00
1	165	277885	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 10:00:00.102227+00	2026-06-10 10:00:00.104358+00
1	169	283936	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 12:00:00.113416+00	2026-06-10 12:00:00.117264+00
1	173	290292	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 14:00:00.181577+00	2026-06-10 14:00:00.185391+00
1	170	285461	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 12:30:00.100697+00	2026-06-10 12:30:00.103955+00
1	178	299098	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 1	2026-06-10 16:30:00.187328+00	2026-06-10 16:30:00.189586+00
1	176	295617	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 15:30:00.166562+00	2026-06-10 15:30:00.168093+00
1	180	302696	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 17:30:00.17877+00	2026-06-10 17:30:00.18012+00
1	182	305829	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 18:30:00.142445+00	2026-06-10 18:30:00.145278+00
1	179	300863	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 17:00:00.189419+00	2026-06-10 17:00:00.193349+00
1	181	304325	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 3	2026-06-10 18:00:00.209458+00	2026-06-10 18:00:00.213433+00
1	187	314200	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 21:00:00.193921+00	2026-06-10 21:00:00.197103+00
1	185	310720	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 20:00:00.182797+00	2026-06-10 20:00:00.187845+00
1	186	312484	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 2	2026-06-10 20:30:00.205237+00	2026-06-10 20:30:00.208107+00
1	188	316179	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 21:30:00.195391+00	2026-06-10 21:30:00.197429+00
1	189	318144	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 22:00:00.228247+00	2026-06-10 22:00:00.233078+00
1	190	319919	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 1	2026-06-10 22:30:00.336007+00	2026-06-10 22:30:00.345009+00
1	191	321723	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 23:00:00.205167+00	2026-06-10 23:00:00.211368+00
1	206	347396	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 06:30:00.082018+00	2026-06-11 06:30:00.086301+00
1	209	351960	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 08:00:00.085395+00	2026-06-11 08:00:00.087397+00
1	192	323226	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-10 23:30:00.088712+00	2026-06-10 23:30:00.09196+00
1	198	333112	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 02:30:00.178098+00	2026-06-11 02:30:00.179564+00
1	203	342226	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 1	2026-06-11 05:00:00.186664+00	2026-06-11 05:00:00.189795+00
1	193	324730	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 3	2026-06-11 00:00:00.081325+00	2026-06-11 00:00:00.088424+00
1	199	334945	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 03:00:00.17128+00	2026-06-11 03:00:00.171876+00
1	194	326315	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 00:30:00.102514+00	2026-06-11 00:30:00.1054+00
1	216	362571	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 11:30:01.088256+00	2026-06-11 11:30:01.091585+00
1	207	348922	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 2	2026-06-11 07:00:00.092684+00	2026-06-11 07:00:00.097609+00
1	195	327881	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 01:00:00.13592+00	2026-06-11 01:00:00.141595+00
1	204	344066	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 05:30:00.179466+00	2026-06-11 05:30:00.181004+00
1	200	336701	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 03:30:00.206009+00	2026-06-11 03:30:00.213442+00
1	196	329568	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 01:30:00.189116+00	2026-06-11 01:30:00.191836+00
1	215	361054	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 11:00:00.089682+00	2026-06-11 11:00:00.092027+00
1	197	331383	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 02:00:00.161492+00	2026-06-11 02:00:00.163582+00
1	201	338419	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 04:00:00.214836+00	2026-06-11 04:00:00.216147+00
1	205	345748	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 06:00:00.19951+00	2026-06-11 06:00:00.202663+00
1	202	339998	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 04:30:00.175151+00	2026-06-11 04:30:00.177687+00
1	210	353479	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 08:30:00.085081+00	2026-06-11 08:30:00.088056+00
1	208	350438	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 07:30:00.079848+00	2026-06-11 07:30:00.082562+00
1	212	356515	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 09:30:00.097149+00	2026-06-11 09:30:00.100511+00
1	214	359541	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 10:30:00.06202+00	2026-06-11 10:30:00.063925+00
1	211	354992	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 09:00:00.071343+00	2026-06-11 09:00:00.075072+00
1	213	358020	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 10:00:00.095152+00	2026-06-11 10:00:00.097506+00
1	219	367218	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 13:00:00.081223+00	2026-06-11 13:00:00.083995+00
1	217	364087	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 12:00:00.090326+00	2026-06-11 12:00:00.092465+00
1	218	365617	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 12:30:00.073398+00	2026-06-11 12:30:00.075535+00
1	220	368735	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 13:30:00.087372+00	2026-06-11 13:30:00.090515+00
1	221	370288	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 14:00:00.04862+00	2026-06-11 14:00:00.05317+00
1	222	371959	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 14:30:00.08535+00	2026-06-11 14:30:00.088799+00
1	223	373470	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 15:00:00.058133+00	2026-06-11 15:00:00.06227+00
1	238	396667	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 22:30:00.086933+00	2026-06-11 22:30:00.08852+00
1	241	401653	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 00:00:00.201733+00	2026-06-12 00:00:00.203858+00
1	224	374983	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 15:30:00.090172+00	2026-06-11 15:30:00.093904+00
1	230	384100	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 18:30:00.101462+00	2026-06-11 18:30:00.103708+00
1	235	392087	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 1	2026-06-11 21:00:00.208095+00	2026-06-11 21:00:00.22001+00
1	225	376500	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 16:00:00.08844+00	2026-06-11 16:00:00.09146+00
1	231	385616	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 19:00:00.06975+00	2026-06-11 19:00:00.071801+00
1	226	378038	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 16:30:00.085452+00	2026-06-11 16:30:00.0877+00
1	239	398319	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 23:00:00.13852+00	2026-06-11 23:00:00.145932+00
1	227	379551	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 17:00:00.070783+00	2026-06-11 17:00:00.07298+00
1	236	393611	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 1	2026-06-11 21:30:00.077755+00	2026-06-11 21:30:00.080462+00
1	232	387220	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 19:30:00.192515+00	2026-06-11 19:30:00.194703+00
1	228	381067	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 17:30:00.082263+00	2026-06-11 17:30:00.085144+00
1	247	412202	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 1	2026-06-12 03:00:00.145803+00	2026-06-12 03:00:00.150279+00
1	229	382578	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 18:00:00.095031+00	2026-06-11 18:00:00.098104+00
1	233	388779	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 20:00:00.198502+00	2026-06-11 20:00:00.199911+00
1	237	395114	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 22:00:00.086794+00	2026-06-11 22:00:00.091628+00
1	234	390489	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 1	2026-06-11 20:30:00.165254+00	2026-06-11 20:30:00.16825+00
1	242	403269	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 00:30:00.152285+00	2026-06-12 00:30:00.156602+00
1	240	399860	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-11 23:30:00.084499+00	2026-06-11 23:30:00.087682+00
1	244	407011	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 01:30:00.204832+00	2026-06-12 01:30:00.209709+00
1	246	410650	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 02:30:00.232919+00	2026-06-12 02:30:00.23766+00
1	243	404921	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 3	2026-06-12 01:00:00.142383+00	2026-06-12 01:00:00.146997+00
1	248	413719	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 2	2026-06-12 03:30:00.095707+00	2026-06-12 03:30:00.100743+00
1	245	408840	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 02:00:00.23555+00	2026-06-12 02:00:00.237798+00
1	251	418243	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 05:00:00.087823+00	2026-06-12 05:00:00.092619+00
1	250	416736	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 04:30:00.08748+00	2026-06-12 04:30:00.091299+00
1	249	415221	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 04:00:00.09428+00	2026-06-12 04:00:00.100829+00
1	252	419760	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 05:30:00.086543+00	2026-06-12 05:30:00.089386+00
1	253	421277	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 06:00:00.099171+00	2026-06-12 06:00:00.101621+00
1	254	422786	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 06:30:00.102391+00	2026-06-12 06:30:00.104838+00
1	269	445596	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 14:00:00.139834+00	2026-06-12 14:00:00.148333+00
1	272	450309	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 15:30:00.083194+00	2026-06-12 15:30:00.086539+00
1	255	424411	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 07:00:00.087194+00	2026-06-12 07:00:00.090327+00
1	261	433466	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 10:00:00.078387+00	2026-06-12 10:00:00.080736+00
1	266	441047	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 12:30:00.079379+00	2026-06-12 12:30:00.08327+00
1	256	425918	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 07:30:00.08488+00	2026-06-12 07:30:00.088143+00
1	262	434991	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 10:30:00.091512+00	2026-06-12 10:30:00.095552+00
1	257	427425	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 08:00:00.061912+00	2026-06-12 08:00:00.065064+00
1	279	461213	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 19:00:00.092749+00	2026-06-12 19:00:00.095046+00
1	270	447269	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 14:30:00.093108+00	2026-06-12 14:30:00.095644+00
1	258	428936	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 08:30:00.0719+00	2026-06-12 08:30:00.074544+00
1	267	442565	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 13:00:00.091445+00	2026-06-12 13:00:00.093687+00
1	263	436506	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 11:00:00.079464+00	2026-06-12 11:00:00.081766+00
1	259	430441	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 09:00:00.093779+00	2026-06-12 09:00:00.096018+00
1	278	459687	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 18:30:00.135033+00	2026-06-12 18:30:00.139828+00
1	260	431954	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 09:30:00.083672+00	2026-06-12 09:30:00.086569+00
1	264	438020	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 11:30:00.111135+00	2026-06-12 11:30:00.115922+00
1	268	444086	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 13:30:00.079778+00	2026-06-12 13:30:00.082035+00
1	265	439531	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 12:00:00.097467+00	2026-06-12 12:00:00.101323+00
1	273	451909	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 16:00:00.092383+00	2026-06-12 16:00:00.095429+00
1	271	448790	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 15:00:00.092985+00	2026-06-12 15:00:00.095342+00
1	275	455009	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 17:00:00.090001+00	2026-06-12 17:00:00.091641+00
1	277	458132	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 18:00:00.092073+00	2026-06-12 18:00:00.095843+00
1	274	453462	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 16:30:00.062517+00	2026-06-12 16:30:00.065345+00
1	276	456525	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 17:30:00.061864+00	2026-06-12 17:30:00.064271+00
1	282	465763	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 20:30:00.09127+00	2026-06-12 20:30:00.093429+00
1	280	462730	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 19:30:00.06773+00	2026-06-12 19:30:00.071627+00
1	281	464239	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 20:00:00.101892+00	2026-06-12 20:00:00.105788+00
1	283	467289	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 21:00:00.086979+00	2026-06-12 21:00:00.090082+00
1	284	468816	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 21:30:00.08212+00	2026-06-12 21:30:00.085567+00
1	285	470339	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 22:00:00.109253+00	2026-06-12 22:00:00.112331+00
1	286	471864	postgres	postgres	\r\n    UPDATE public.usuario\r\n    SET is_online = false\r\n    WHERE is_online = true\r\n      AND last_seen < now() - interval '1 hour';\r\n  	succeeded	UPDATE 0	2026-06-12 22:30:00.082169+00	2026-06-12 22:30:00.084977+00
\.


--
-- Data for Name: categoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categoria (id, nombre, descripcion, logo, created_at, updated_at) FROM stdin;
117e7c6d-ebe1-41ec-ae39-52b64e6e64b4	KuboGestión	CRM + proyectos, tareas, facturación e historial de clientes en una sola plataforma.	/assets/categorias/favicon-kubogestion.svg	2026-06-07 06:03:23.934332+00	2026-06-07 07:21:53.422265+00
47ea7ab2-9fd2-47cf-9afd-67ca379c214d	KuboReservas	Panel de turnos online con recordatorios automáticos y análisis de ocupación IA.	/assets/categorias/favicon-kuboreservas.svg	2026-06-07 06:03:23.934332+00	2026-06-07 07:21:53.422265+00
d6b60a1c-4666-4f00-a4ac-2c3ab7d8c871	KuboInventario	Sistema de inventario y punto de venta con predicción de stock por IA.	/assets/categorias/favicon-kuboinventario.svg	2026-06-07 06:03:23.934332+00	2026-06-07 07:21:53.422265+00
d0baf1e0-3538-4b08-abfe-e80b435c4154	KuboRRHH	Portal de onboarding de empleados y clientes SaaS con flujos IA adaptativos.	/assets/categorias/favicon-kuborrhh.svg	2026-06-07 06:03:23.934332+00	2026-06-07 07:21:53.422265+00
eb5648e9-5c3f-42e7-807b-7a5247169673	KuboMétricas	Dashboard de métricas de negocio con análisis IA y alertas en lenguaje natural.	/assets/categorias/favicon-kubometricas.svg	2026-06-07 06:03:23.934332+00	2026-06-07 07:21:53.422265+00
1a916bf1-af35-4bba-9418-f41caef3c559	KuboJuegos	Plataforma para desarrollar y publicar videojuegos indie con analítica IA de jugadores en tiempo real.	/assets/categorias/favicon-kubojuegos.svg	2026-06-07 06:03:23.934332+00	2026-06-07 07:21:53.422265+00
\.


--
-- Data for Name: producto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producto (id, logo_url, nombre, descripcion, categoria, requiere_suscripcion, admin_key, admin_pwd, created_at, updated_at) FROM stdin;
ace0f9e4-cfd0-48de-8c9e-192749b2e6bf	favicon-kuboteg.svg	KuboTeg	Juego de estrategia de guerra para 2-6 jugadores: conquistá territorios, y dominá a tus rivales.	KuboJuegos	t	\N	\N	2026-06-06 22:21:42.433241+00	2026-06-07 16:36:28.640506+00
\.


--
-- Data for Name: categoria_producto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categoria_producto (id, categoria_id, producto_id, created_at) FROM stdin;
07642a1d-e14c-4647-9e83-1b3cfa38b838	1a916bf1-af35-4bba-9418-f41caef3c559	ace0f9e4-cfd0-48de-8c9e-192749b2e6bf	2026-06-07 06:04:09.384725+00
\.


--
-- Data for Name: contacto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contacto (id, nombre, email, empresa, rubro, mensaje, created_at) FROM stdin;
\.


--
-- Data for Name: lider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lider (nombre, img_neutra, img_amigable, img_hostil) FROM stdin;
Adolfo Hitler	/assets/KuboTeg/Lideres/adolf/adolf.png	/assets/KuboTeg/adolf/adolf-amigable.png	/assets/KuboTeg/adolf/adolf-enojado.png
Alberto Fernandez	/assets/KuboTeg/Lideres/alberto/alberto.png	/assets/KuboTeg/alberto/alberto-amigable.png	/assets/KuboTeg/alberto/alberto-enojado.png
Bin Laden	/assets/KuboTeg/Lideres/bin laden/bin laden.png	/assets/KuboTeg/bin laden/bin laden-amigable.png	/assets/KuboTeg/bin laden/bin laden-enojado.png
Jair Bolsonaro	/assets/KuboTeg/Lideres/bolsonaro/bolsonaro.png	/assets/KuboTeg/bolsonaro/bolsonaro-amigable.png	/assets/KuboTeg/bolsonaro/bolsonaro-enojado.png
Nayib Bukele	/assets/KuboTeg/Lideres/bukele/bukele.png	/assets/KuboTeg/bukele/bukele-amigable.png	/assets/KuboTeg/bukele/bukele-enojado.png
George Bush	/assets/KuboTeg/Lideres/bush/bush.png	/assets/KuboTeg/bush/bush-amigable.png	/assets/KuboTeg/bush/bush-enojado.png
Hugo Chavez	/assets/KuboTeg/Lideres/chavez/chavez.png	/assets/KuboTeg/chavez/chavez-amigable.png	/assets/KuboTeg/chavez/chavez-enojado.png
Winston Churchil	/assets/KuboTeg/Lideres/churchil/churchil.png	/assets/KuboTeg/churchil/churchil-amigable.png	/assets/KuboTeg/churchil/churchil-enojado.png
Cristina Kirchner	/assets/KuboTeg/Lideres/cristina/cristina.png	/assets/KuboTeg/cristina/cristina-amigable.png	/assets/KuboTeg/cristina/cristina-enojada.png
Evo Morales	/assets/KuboTeg/Lideres/evo/evo.png	/assets/KuboTeg/evo/evo-amigable.png	/assets/KuboTeg/evo/evo-enojado.png
Fidel Castro	/assets/KuboTeg/Lideres/fidel/fidel.png	/assets/KuboTeg/fidel/fidel-amigable.png	/assets/KuboTeg/fidel/fidel-enojado.png
Muamar el Gadafi	/assets/KuboTeg/Lideres/gadafi/gadafi.png	/assets/KuboTeg/gadafi/gadafi-amigable.png	/assets/KuboTeg/gadafi/gadafi-enojado.png
Mahatma Gandhi	/assets/KuboTeg/Lideres/ghandi/ghandi.png	/assets/KuboTeg/ghandi/ghandi-amigable.png	/assets/KuboTeg/ghandi/ghandi-enojado.png
Idi Amin	/assets/KuboTeg/Lideres/idi amin/idi amin.png	/assets/KuboTeg/idi amin/idi amin-amigable.png	/assets/KuboTeg/idi amin/idi amin-enojado.png
Kim Jong uU	/assets/KuboTeg/Lideres/kim jong un/kim jong un.png	/assets/KuboTeg/kim jong un/kim jong un-amigable.png	/assets/KuboTeg/kim jong un/kim jong un-enojado.png
Lacalle Pou	/assets/KuboTeg/Lideres/lacalle pou/lacalle pou.png	/assets/KuboTeg/lacalle pou/lacalle pou-amigable.png	/assets/KuboTeg/lacalle pou/lacalle pou-enojado.png
Lula Da Silva	/assets/KuboTeg/Lideres/lula/lula.png	/assets/KuboTeg/lula/lula-amigable.png	/assets/KuboTeg/lula/lula-enojado.png
Mauricio Macri	/assets/KuboTeg/Lideres/macri/macri.png	/assets/KuboTeg/macri/macri-amigable.png	/assets/KuboTeg/macri/macri-enojado.png
Nicolas Maduro	/assets/KuboTeg/Lideres/maduro/maduro.png	/assets/KuboTeg/maduro/maduro-amigable.png	/assets/KuboTeg/maduro/maduro-enojado.png
Margaret Tacher	/assets/KuboTeg/Lideres/margaret tacher/margaret tacher.png	/assets/KuboTeg/margaret tacher/margaret tacher-amigable.png	/assets/KuboTeg/margaret tacher/margaret tacher-enojado.png
Giorgia Meloni	/assets/KuboTeg/Lideres/meloni/meloni.png	/assets/KuboTeg/meloni/meloni-amigable.png	/assets/KuboTeg/meloni/meloni-enojada.png
Angela Merkel	/assets/KuboTeg/Lideres/merkel/merkel.png	/assets/KuboTeg/merkel/merkel-amigable.png	/assets/KuboTeg/merkel/merkel-enojada.png
Javier Milei	/assets/KuboTeg/Lideres/milei/milei.png	/assets/KuboTeg/milei/milei-amigable.png	/assets/KuboTeg/milei/milei-enojado.png
Benito Musolini	/assets/KuboTeg/Lideres/musolini/musolini.png	/assets/KuboTeg/musolini/musolini-amigable.png	/assets/KuboTeg/musolini/musolini-enojado.png
Benjamín Netanyahu	/assets/KuboTeg/Lideres/netanyahu/netanyahu.png	/assets/KuboTeg/netanyahu/netanyahu-amigable.png	/assets/KuboTeg/netanyahu/netanyahu-enojado.png
Barack Obama	/assets/KuboTeg/Lideres/Obama/Obama.png	/assets/KuboTeg/Obama/Obama-amigable.png	/assets/KuboTeg/Obama/Obama-enojado.png
Yamandu Orsi	/assets/KuboTeg/Lideres/orsi/orsi.png	/assets/KuboTeg/orsi/orsi-amigable.png	/assets/KuboTeg/orsi/orsi-enojado.png
Pedro Castillo	/assets/KuboTeg/Lideres/pedro castillo/pedro castillo.png	/assets/KuboTeg/pedro castillo/pedro castillo-amigable.png	/assets/KuboTeg/pedro castillo/pedro castillo-enojado.png
Pepe Mujica	/assets/KuboTeg/Lideres/pepe/pepe.png	/assets/KuboTeg/pepe/pepe-amigable.png	/assets/KuboTeg/pepe/pepe-enojado.png
Perón	/assets/KuboTeg/Lideres/peron/peron.png	/assets/KuboTeg/peron/peron-amigable.png	/assets/KuboTeg/peron/peron-enojado.png
Vladimir Putin	/assets/KuboTeg/Lideres/putin/putin.png	/assets/KuboTeg/putin/putin-amigable.png	/assets/KuboTeg/putin/putin-enojado.png
Saddam Hussein	/assets/KuboTeg/Lideres/saddam hussein/saddam hussein.png	/assets/KuboTeg/saddam hussein/saddam hussein-amigable.png	/assets/KuboTeg/saddam hussein/saddam hussein-enojado.png
Iósif Staline	/assets/KuboTeg/Lideres/staline/staline.png	/assets/KuboTeg/staline/staline-amigable.png	/assets/KuboTeg/staline/staline-enojado.png
Donald Trump	/assets/KuboTeg/Lideres/trump/trump.png	/assets/KuboTeg/trump/trump-amigable.png	/assets/KuboTeg/trump/trump-enojado.png
Xi Jinping	/assets/KuboTeg/Lideres/xi jinping/xi jinping.png	/assets/KuboTeg/xi jinping/xi jinping-amigable.png	/assets/KuboTeg/xi jinping/xi jinping-enojado.png
Zelensky	/assets/KuboTeg/Lideres/zelensky/zelensky.png	/assets/KuboTeg/zelensky/zelensky-amigable.png	/assets/KuboTeg/zelensky/zelensky-enojado.png
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id, email, nombre, apellido, is_online, last_seen, created_at, is_admin, mensaje) FROM stdin;
ce8137fb-b064-44ca-b311-8873ed80760f	fvolonte@gmail.com	Federico	Volonte	f	2026-06-12 01:59:32.371+00	2026-06-07 03:14:01.041557+00	f	dsf
4c8744f3-c044-49c3-a42e-97bac2bd7265	mmethol@gmail.com	Marcos	Methol	f	2026-06-12 02:17:14.493+00	2026-06-07 02:58:23.319076+00	f	estamos todos
a8162597-af98-4abd-92ec-aa4cdee8b760	pmethol94@gmail.com	Pedro	Methol	f	2026-06-12 02:17:26.824+00	2026-06-06 21:44:38.910117+00	t	sdsdf
e4952765-2fcf-44b7-8821-13c99353b5e9	dperez@gmail.com	Daniel	Perez	f	\N	2026-06-10 22:41:42.615747+00	f	\N
aff743af-2352-4997-93b3-42d8859dfd7e	lmethol@gmail.com	Lucas	Methol	f	2026-06-11 19:03:50.07+00	2026-06-06 21:45:27.225342+00	f	kjlljkkjl
b9eabdb4-bf05-4581-9f3f-1a28bf7128fa	jperez@gmail.com	Juan	Perez	f	2026-06-11 02:30:20.549+00	2026-06-06 21:59:14.909829+00	f	\N
\.


--
-- Data for Name: partida; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partida (id, nombre, producto_id, host_id, limite_jugadores, jugadores_registrados, estado, ganador_id, requiere_contrasena, contrasena, created_at, updated_at, turno_actual_usuario_id, fase_actual, ronda_actual, orden_jugadores, jugador_actual_index, tropas_iniciales) FROM stdin;
83064d0d-84a4-4eb4-8d4b-a66c911b38a1	nnnn	ace0f9e4-cfd0-48de-8c9e-192749b2e6bf	ce8137fb-b064-44ca-b311-8873ed80760f	2	2	Iniciada	\N	f	\N	2026-06-11 23:39:59.421751+00	2026-06-12 02:17:17.39611+00	\N	\N	1	\N	0	\N
c6c0dc1d-86b6-425f-9d72-9594f17d5116	jjjbdhhdhhd	ace0f9e4-cfd0-48de-8c9e-192749b2e6bf	4c8744f3-c044-49c3-a42e-97bac2bd7265	2	2	En juego	\N	f	\N	2026-06-11 23:42:22.459406+00	2026-06-11 23:42:51.413259+00	\N	\N	1	\N	0	\N
f0c89ceb-2304-4626-92f5-d115f9adba1e	vvava	ace0f9e4-cfd0-48de-8c9e-192749b2e6bf	ce8137fb-b064-44ca-b311-8873ed80760f	2	2	Finalizada	ce8137fb-b064-44ca-b311-8873ed80760f	f	\N	2026-06-11 02:31:19.742479+00	2026-06-11 02:58:07.744695+00	\N	reagrupacion	2	["ce8137fb-b064-44ca-b311-8873ed80760f", "a8162597-af98-4abd-92ec-aa4cdee8b760"]	0	\N
81c2d5fc-a8e4-4b28-80dd-623e18f528cf	qqqqqqqqqq	ace0f9e4-cfd0-48de-8c9e-192749b2e6bf	a8162597-af98-4abd-92ec-aa4cdee8b760	2	2	En juego	\N	f	\N	2026-06-12 02:17:44.463597+00	2026-06-12 02:19:02.938997+00	\N	ataque	1	["4c8744f3-c044-49c3-a42e-97bac2bd7265", "a8162597-af98-4abd-92ec-aa4cdee8b760"]	0	5
0b3d9401-1aca-4284-acbc-94b02ff79399	ttttrrt	ace0f9e4-cfd0-48de-8c9e-192749b2e6bf	a8162597-af98-4abd-92ec-aa4cdee8b760	2	2	Finalizada	a8162597-af98-4abd-92ec-aa4cdee8b760	f	\N	2026-06-11 03:30:58.397861+00	2026-06-11 03:41:16.792045+00	\N	ataque	1	["a8162597-af98-4abd-92ec-aa4cdee8b760", "ce8137fb-b064-44ca-b311-8873ed80760f"]	0	\N
ede0b0ad-4aab-4361-8ff0-a4721a7c4184	NuevaPartida	ace0f9e4-cfd0-48de-8c9e-192749b2e6bf	b9eabdb4-bf05-4581-9f3f-1a28bf7128fa	2	2	En juego	\N	f	\N	2026-06-11 01:39:16.890775+00	2026-06-11 01:48:44.106782+00	b9eabdb4-bf05-4581-9f3f-1a28bf7128fa	\N	1	\N	0	\N
\.


--
-- Data for Name: notificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notificacion (id, usuario_id, partida_id, mensaje, leida, created_at) FROM stdin;
5e18a9f0-2550-4000-acfe-0a3fc576d0e7	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "ParidaNueva" comenzó! Hacé clic para jugar.	t	2026-06-06 23:49:47.228915+00
f174c35a-cf57-415d-afa7-7bd3ed960a16	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "bbggb" comenzó! Hacé clic para jugar.	t	2026-06-07 17:16:47.9942+00
580a288e-680b-4576-9b87-c2824bbcda0d	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "ParidaNueva" comenzó! Hacé clic para jugar.	t	2026-06-06 23:49:47.559551+00
4f9d764d-b4dd-47f5-ab58-d6c9080c9e2c	b9eabdb4-bf05-4581-9f3f-1a28bf7128fa	\N	¡La partida "oppp" comenzó! Hacé clic para jugar.	t	2026-06-07 00:15:00.216929+00
422f3426-c7b0-44d3-8e44-4a0e09bb913b	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "oppp" comenzó! Hacé clic para jugar.	t	2026-06-07 00:14:59.909398+00
bd6b6609-68ff-40a5-8f25-e8af3a5269ce	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "bbggb" comenzó! Hacé clic para jugar.	t	2026-06-07 17:16:47.659773+00
ddcf4982-53d5-462b-871d-99de70634278	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "NuevaPartida" comenzó! Hacé clic para jugar.	t	2026-06-07 00:32:31.290873+00
3de852c5-2b70-44e9-bbd8-f8cb3810cdf7	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "NuevaPartida" comenzó! Hacé clic para jugar.	t	2026-06-07 00:32:30.959794+00
d6dcdb3a-c27d-4fc8-b988-fff34a29b794	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "kkkkkk" comenzó! Hacé clic para jugar.	t	2026-06-10 15:30:48.969179+00
82630240-9c45-4382-a0c0-d8ca9badc80b	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "asdads" comenzó! Hacé clic para jugar.	t	2026-06-10 15:04:08.651412+00
b27ca4d5-609c-4cee-815c-4f4f4c66a5d1	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "asdads" comenzó! Hacé clic para jugar.	t	2026-06-10 15:04:08.969408+00
8deef2ed-ac80-44dd-8497-8c6b3d699d2a	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "Partidaaa" comenzó! Hacé clic para jugar.	t	2026-06-10 13:27:28.227215+00
6238f8d0-3f10-499e-a8c6-f0b46d2cbfed	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "Partidaaa" comenzó! Hacé clic para jugar.	t	2026-06-10 13:27:28.518179+00
b31edf0b-d558-40cc-baa8-e20ad0de4bcb	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "aaaa" comenzó! Hacé clic para jugar.	t	2026-06-10 13:37:16.226708+00
82180831-094a-4233-9c16-a05b8588827d	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "aaaa" comenzó! Hacé clic para jugar.	t	2026-06-10 13:37:16.488087+00
a79d6602-e32f-4184-8583-591a9cf89582	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "adsasd" comenzó! Hacé clic para jugar.	t	2026-06-10 15:39:59.520144+00
fb1b7382-6ba4-4bbc-b549-1f95e1091683	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "asdsaasd" comenzó! Hacé clic para jugar.	t	2026-06-10 13:39:39.135941+00
5990cce1-8d29-46b8-8e2f-aeab359126b1	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "asdsaasd" comenzó! Hacé clic para jugar.	t	2026-06-10 13:39:38.87613+00
3a90735e-c7b7-41dd-8e38-7244c4498055	b9eabdb4-bf05-4581-9f3f-1a28bf7128fa	\N	¡La partida "ddfdgd" comenzó! Hacé clic para jugar.	t	2026-06-10 07:19:28.35095+00
e437a953-d0af-4a71-9ba7-7b8ea1e4ed6b	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "ddfdgd" comenzó! Hacé clic para jugar.	t	2026-06-10 07:19:29.052328+00
fd2b9158-6fe5-4e32-bcbd-ffabd61ca4a8	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "kkkkkk" comenzó! Hacé clic para jugar.	t	2026-06-10 15:30:49.295028+00
9f96052a-2bc5-4229-90af-89d884b137ef	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "adsasd" comenzó! Hacé clic para jugar.	t	2026-06-10 15:39:59.775789+00
5bcf27ef-23a9-4208-8aee-4ed956b9f5d8	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "afdfdsd" comenzó! Hacé clic para jugar.	t	2026-06-10 15:31:04.425311+00
02ab2cc2-800a-4911-8cb1-41af1fc42a79	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "afdfdsd" comenzó! Hacé clic para jugar.	t	2026-06-10 15:31:04.694938+00
b3f194a8-6408-4256-bc15-d7183a08839a	4c8744f3-c044-49c3-a42e-97bac2bd7265	\N	¡La partida "vvvvv" comenzó! Hacé clic para jugar.	t	2026-06-10 16:17:23.902887+00
697cf490-5dbd-44a2-b0f9-a8d93f1a0911	ce8137fb-b064-44ca-b311-8873ed80760f	\N	¡La partida "Partida de 3" comenzó! Hacé clic para jugar.	t	2026-06-10 16:55:08.553601+00
48364f3c-3e3a-46ce-ad0b-a53ab8931d2b	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "Partida Belen" comenzó! Hacé clic para jugar.	t	2026-06-10 15:41:07.125162+00
5d033e53-13c8-4ade-98d6-4e3fa5de872b	ce8137fb-b064-44ca-b311-8873ed80760f	\N	¡La partida "nnnnn" comenzó! Hacé clic para jugar.	t	2026-06-10 16:35:43.425707+00
09729fd1-53a8-4298-9cd7-ba5e5c7a0343	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "vvvvv" comenzó! Hacé clic para jugar.	t	2026-06-10 16:17:23.614239+00
7172fdff-8a2b-4b16-8271-42f7efa35504	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "nnnnn" comenzó! Hacé clic para jugar.	t	2026-06-10 16:35:43.154535+00
c2f11d58-70c2-4a84-bd02-f3f3def43bc3	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "Partida Belen" comenzó! Hacé clic para jugar.	t	2026-06-10 15:41:07.441687+00
5468bbed-a39e-44e7-8dfc-2059fa67927f	4c8744f3-c044-49c3-a42e-97bac2bd7265	\N	¡La partida "Partida de 3" comenzó! Hacé clic para jugar.	t	2026-06-10 16:55:08.816358+00
7c017061-0f22-4bd9-8e9f-d3a186d70622	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "PartidaEjemplo" comenzó! Hacé clic para jugar.	t	2026-06-10 03:36:15.582666+00
5e378b78-f391-4713-90f8-38e7d3a500e4	ce8137fb-b064-44ca-b311-8873ed80760f	\N	¡La partida "PartidaEjemplo" comenzó! Hacé clic para jugar.	t	2026-06-10 03:36:15.882579+00
bd9b00a8-775b-44ad-a36a-8bb69378850d	4c8744f3-c044-49c3-a42e-97bac2bd7265	\N	¡La partida "menchos" comenzó! Hacé clic para jugar.	t	2026-06-07 03:19:16.516102+00
f23c28cd-579c-4396-ba18-6e9f7980d0d5	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "menchos" comenzó! Hacé clic para jugar.	t	2026-06-07 03:19:16.212799+00
1a025f24-717d-4965-b8e1-bd505638b88e	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "Partida de 3" comenzó! Hacé clic para jugar.	t	2026-06-10 16:55:08.289397+00
395791de-e820-4ab7-8e89-3b2a8e28340c	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "bbbasaa" comenzó! Hacé clic para jugar.	t	2026-06-10 19:22:39.210985+00
23f4b536-5adc-4ce8-b870-e2182880bd6d	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "bbbasaa" comenzó! Hacé clic para jugar.	t	2026-06-10 19:22:39.467639+00
5c36021a-9d4b-45da-8dee-4511a7dd4292	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "vffvfvfaxxxxx" comenzó! Hacé clic para jugar.	t	2026-06-10 22:08:27.010142+00
8e706498-59ef-48e2-a22e-9a944618b856	ce8137fb-b064-44ca-b311-8873ed80760f	\N	¡La partida "vffvfvfaxxxxx" comenzó! Hacé clic para jugar.	t	2026-06-10 22:08:26.582921+00
f82db943-acfe-4fad-8b04-92533119dd50	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "menchos" comenzó! Hacé clic para jugar.	t	2026-06-07 03:19:16.874482+00
34dc9c29-ad69-49cb-9cf4-6efae28ee426	ce8137fb-b064-44ca-b311-8873ed80760f	\N	¡La partida "menchos" comenzó! Hacé clic para jugar.	t	2026-06-07 03:19:17.137105+00
edee1731-69f0-4f44-a171-f055ece50957	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "ssdfdssdf" comenzó! Hacé clic para jugar.	t	2026-06-07 00:46:34.770709+00
e4b9ff83-79f5-4cfa-bcdb-fe95dde8053b	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "ssdfdssdf" comenzó! Hacé clic para jugar.	t	2026-06-07 00:46:34.474616+00
ed837c19-720e-45a5-b5f8-9ae06214fe4f	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "Menchos" comenzó! Hacé clic para jugar.	t	2026-06-07 05:39:51.031793+00
c6aec56e-7143-439e-84db-a9436d0184ab	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "Menchos" comenzó! Hacé clic para jugar.	t	2026-06-07 05:39:51.354811+00
84b3d32d-50c9-409f-b2f1-b3728e37766f	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "hmhmh" comenzó! Hacé clic para jugar.	t	2026-06-10 19:31:56.332611+00
d1eedc52-2800-460d-955f-41ee099d4b9a	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "hmhmh" comenzó! Hacé clic para jugar.	t	2026-06-10 19:31:56.071583+00
4c9b9153-8d67-4795-8088-c8781ac1cfa5	4c8744f3-c044-49c3-a42e-97bac2bd7265	\N	¡La partida "Partida Fede" comenzó! Hacé clic para jugar.	t	2026-06-10 22:43:34.313594+00
61942674-9202-482b-aa05-1928c52831b2	ce8137fb-b064-44ca-b311-8873ed80760f	\N	¡La partida "Partida Fede" comenzó! Hacé clic para jugar.	t	2026-06-10 22:43:33.169217+00
638aa8b7-1a06-4eec-8460-be41e68a096e	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "Partida Fede" comenzó! Hacé clic para jugar.	t	2026-06-10 22:43:34.049099+00
0e7fb881-eb76-412f-825c-faf5eec9f237	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "Partida Fede" comenzó! Hacé clic para jugar.	t	2026-06-10 22:43:33.784204+00
6194160c-71d9-4c56-a795-bfd79e0e34dc	e4952765-2fcf-44b7-8821-13c99353b5e9	\N	¡La partida "Partida Fede" comenzó! Hacé clic para jugar.	t	2026-06-10 22:43:34.888915+00
91d8300e-c055-43ce-baf9-2844ac4eefe1	ce8137fb-b064-44ca-b311-8873ed80760f	\N	¡La partida "bbbbbggg" comenzó! Hacé clic para jugar.	t	2026-06-10 22:11:12.067573+00
e63217a6-f964-4a8d-929a-ee372ee578f7	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "bbbbbggg" comenzó! Hacé clic para jugar.	t	2026-06-10 22:11:12.783026+00
a949d9ed-d246-4001-aa9a-a063a659484a	b9eabdb4-bf05-4581-9f3f-1a28bf7128fa	\N	¡La partida "Partida Fede" comenzó! Hacé clic para jugar.	t	2026-06-10 22:43:33.471326+00
8ba19ecd-1ba2-4744-adc5-c7ab8a4db496	ce8137fb-b064-44ca-b311-8873ed80760f	\N	¡La partida "rrggfdf" comenzó! Hacé clic para jugar.	t	2026-06-10 21:28:17.014168+00
de2707a3-1539-4b09-b4b4-bd90151343b7	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "rrggfdf" comenzó! Hacé clic para jugar.	t	2026-06-10 21:28:17.324686+00
aac81486-c85b-409d-9df7-d6f52810c170	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "vfffvfv" comenzó! Hacé clic para jugar.	t	2026-06-10 21:31:56.665169+00
067d29ab-85bd-4ecf-8852-28abe26756cc	ce8137fb-b064-44ca-b311-8873ed80760f	\N	¡La partida "vfffvfv" comenzó! Hacé clic para jugar.	t	2026-06-10 21:31:56.989028+00
0f2a645f-4b83-49c3-b0a3-8b79d18a07a8	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "nngngnng" comenzó! Hacé clic para jugar.	t	2026-06-10 19:31:22.960522+00
6006898f-a7ca-4973-93b6-672093358db2	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "nngngnng" comenzó! Hacé clic para jugar.	t	2026-06-10 19:31:22.70683+00
6964b9af-6cdf-45c1-bb7f-5f0951eff844	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "Pedro" comenzó! Hacé clic para jugar.	t	2026-06-07 02:01:08.80723+00
4a246889-c361-4d5d-a116-33c06e3151ff	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "Pedro" comenzó! Hacé clic para jugar.	t	2026-06-07 02:01:08.440111+00
3119cecb-dd07-43ed-b198-1b80c2809b38	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "adsas" comenzó! Hacé clic para jugar.	t	2026-06-07 02:01:42.272508+00
5a403bf0-c364-47bd-88a6-222174aecf93	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "adsas" comenzó! Hacé clic para jugar.	t	2026-06-07 02:01:42.558899+00
35f670fa-a06f-4f72-9339-0c2f01410975	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "hghnh" comenzó! Hacé clic para jugar.	t	2026-06-10 19:34:09.426661+00
0dbfb17f-ae69-4bab-850f-fd18c39afc1e	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "hghnh" comenzó! Hacé clic para jugar.	t	2026-06-10 19:34:09.165194+00
f8917642-991a-4c33-8e2b-d74f14120055	4c8744f3-c044-49c3-a42e-97bac2bd7265	\N	¡La partida "Nebc" comenzó! Hacé clic para jugar.	t	2026-06-07 06:48:09.476353+00
54610bbc-55a2-4d2b-9870-ea9c784ad855	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "Nebc" comenzó! Hacé clic para jugar.	t	2026-06-07 06:48:09.220185+00
bf015064-f859-475e-978f-895653e16742	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "Nebc" comenzó! Hacé clic para jugar.	t	2026-06-07 06:48:08.91015+00
3537299c-b096-4cd4-856b-bc6091b25504	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "gfgfsg" comenzó! Hacé clic para jugar.	t	2026-06-07 02:25:37.674479+00
2cf98653-7fe3-484f-8eee-9c9a53b44a3e	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "gfgfsg" comenzó! Hacé clic para jugar.	t	2026-06-07 02:25:37.090946+00
b503b3e1-3571-4e77-a9ca-ee163ec461fb	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "fdfgf" comenzó! Hacé clic para jugar.	t	2026-06-10 20:29:40.761378+00
b5ff23a4-e3f2-46c3-a72b-e5f76759b9db	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "fdfgf" comenzó! Hacé clic para jugar.	t	2026-06-10 20:29:40.475107+00
26474775-fd2c-4d5d-a758-8ca60b1d6b71	b9eabdb4-bf05-4581-9f3f-1a28bf7128fa	\N	¡La partida "nnnnn" comenzó! Hacé clic para jugar.	t	2026-06-10 22:42:49.880393+00
725c7dd5-38e6-4356-a961-b9510caa2755	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "nnnnn" comenzó! Hacé clic para jugar.	t	2026-06-10 22:42:50.160602+00
0f20fc7f-6c07-455c-b1fd-065b37557f1d	ce8137fb-b064-44ca-b311-8873ed80760f	\N	¡La partida "fefefefe" comenzó! Hacé clic para jugar.	t	2026-06-10 21:21:01.040367+00
cb6c7c95-d6d1-4488-90e4-3e6e34c6c0b8	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "fefefefe" comenzó! Hacé clic para jugar.	t	2026-06-10 21:21:01.408227+00
9aa9170a-f1a0-4b91-865b-0c4c7f1ac7cc	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "adsda" comenzó! Hacé clic para jugar.	t	2026-06-07 18:23:10.041695+00
a3d632b7-a0bf-46a3-b317-a18eab9c799b	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "adsda" comenzó! Hacé clic para jugar.	t	2026-06-07 18:23:09.760115+00
c4458ee0-3dde-48ce-aef0-07eb8dc68a89	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "Partida Ejemplo" comenzó! Hacé clic para jugar.	t	2026-06-07 20:53:59.992627+00
61a03c6c-6be6-462c-9109-34adbb181eae	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "Partida Ejemplo" comenzó! Hacé clic para jugar.	t	2026-06-07 20:54:00.284275+00
9efbbebc-d1c2-4256-8ca4-a08f8e4668a8	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "nuevaP" comenzó! Hacé clic para jugar.	t	2026-06-10 19:19:13.783871+00
07445049-b4c4-406e-9d6a-3b931b8cddce	aff743af-2352-4997-93b3-42d8859dfd7e	\N	¡La partida "nuevaP" comenzó! Hacé clic para jugar.	t	2026-06-10 19:19:14.058339+00
19f12b6e-1374-4e1f-93c9-fd48fd023a7a	a8162597-af98-4abd-92ec-aa4cdee8b760	ede0b0ad-4aab-4361-8ff0-a4721a7c4184	¡La partida "NuevaPartida" comenzó! Hacé clic para jugar.	t	2026-06-11 01:39:30.670094+00
c5869af8-d3ad-4d5d-bd67-65ca3040cd4c	b9eabdb4-bf05-4581-9f3f-1a28bf7128fa	ede0b0ad-4aab-4361-8ff0-a4721a7c4184	¡La partida "NuevaPartida" comenzó! Hacé clic para jugar.	t	2026-06-11 01:39:30.345444+00
b5f68e73-605e-4a15-85bf-2b4573a1951f	4c8744f3-c044-49c3-a42e-97bac2bd7265	c6c0dc1d-86b6-425f-9d72-9594f17d5116	¡La partida "jjjbdhhdhhd" comenzó! Hacé clic para jugar.	t	2026-06-11 23:42:50.622803+00
369f2cc5-8999-4483-9c3c-5e8ca3a93a14	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "bbbb" comenzó! Hacé clic para jugar.	t	2026-06-11 02:27:15.694411+00
fa3f02b3-bded-4eec-91bc-d07352d72328	b9eabdb4-bf05-4581-9f3f-1a28bf7128fa	\N	¡La partida "bbbb" comenzó! Hacé clic para jugar.	t	2026-06-11 02:27:16.012631+00
8ecab410-85fc-465b-a2fd-5356389a8279	ce8137fb-b064-44ca-b311-8873ed80760f	f0c89ceb-2304-4626-92f5-d115f9adba1e	¡La partida "vvava" comenzó! Hacé clic para jugar.	t	2026-06-11 02:31:36.582569+00
6c3ddfa2-754c-43bf-84e1-3a3b13b49f3a	a8162597-af98-4abd-92ec-aa4cdee8b760	f0c89ceb-2304-4626-92f5-d115f9adba1e	¡La partida "vvava" comenzó! Hacé clic para jugar.	t	2026-06-11 02:31:36.915731+00
4822f35c-8231-4fae-a715-240828fdea3e	ce8137fb-b064-44ca-b311-8873ed80760f	0b3d9401-1aca-4284-acbc-94b02ff79399	¡La partida "ttttrrt" comenzó! Hacé clic para jugar.	t	2026-06-11 03:31:08.747127+00
1f1c79c2-4555-427e-a998-69cd96a2ffe6	a8162597-af98-4abd-92ec-aa4cdee8b760	0b3d9401-1aca-4284-acbc-94b02ff79399	¡La partida "ttttrrt" comenzó! Hacé clic para jugar.	t	2026-06-11 03:31:08.412776+00
c51cbc49-de83-489e-80ce-068cfeabe139	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "qqwqwq" comenzó! Hacé clic para jugar.	t	2026-06-12 01:33:59.483591+00
ea2c8248-d1cb-4374-8068-58f6e7b7a502	ce8137fb-b064-44ca-b311-8873ed80760f	\N	¡La partida "qqwqwq" comenzó! Hacé clic para jugar.	t	2026-06-12 01:33:59.785496+00
e494134a-e6a4-4684-8ee6-1eb57bfdd07b	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "bqqqqqqqqqq" comenzó! Hacé clic para jugar.	t	2026-06-11 03:41:49.413028+00
29f58330-9d94-4099-89e3-7564ed1ab581	ce8137fb-b064-44ca-b311-8873ed80760f	\N	¡La partida "bqqqqqqqqqq" comenzó! Hacé clic para jugar.	t	2026-06-11 03:41:49.659313+00
782137f1-3b5f-4c23-931b-ab29083fc060	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "zxzxxxxz" comenzó! Hacé clic para jugar.	t	2026-06-12 01:59:42.669535+00
ad1fb0ca-6f02-45ec-ad99-460c9a745229	ce8137fb-b064-44ca-b311-8873ed80760f	\N	¡La partida "zxzxxxxz" comenzó! Hacé clic para jugar.	f	2026-06-12 01:59:42.983868+00
441f5893-834a-42cf-ac0c-76add9006c3c	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "asdas" comenzó! Hacé clic para jugar.	t	2026-06-11 19:52:44.208727+00
dd1bd71a-db99-44e0-a7ae-bd3606f2bfde	4c8744f3-c044-49c3-a42e-97bac2bd7265	\N	¡La partida "asdas" comenzó! Hacé clic para jugar.	t	2026-06-11 19:52:44.45215+00
6213d79d-bf31-4401-9663-5ab4921fa2e5	a8162597-af98-4abd-92ec-aa4cdee8b760	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	¡La partida "qqqqqqqqqq" comenzó! Hacé clic para jugar.	f	2026-06-12 02:17:54.324522+00
210a62d0-56c6-4f0f-ac1d-43929979f1a8	4c8744f3-c044-49c3-a42e-97bac2bd7265	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	¡La partida "qqqqqqqqqq" comenzó! Hacé clic para jugar.	f	2026-06-12 02:17:54.623427+00
fbcdb54a-c67a-4475-85c0-822ae9f17999	a8162597-af98-4abd-92ec-aa4cdee8b760	c6c0dc1d-86b6-425f-9d72-9594f17d5116	¡La partida "jjjbdhhdhhd" comenzó! Hacé clic para jugar.	t	2026-06-11 23:42:51.014093+00
b7fa9838-8eeb-4480-8194-33b0c4a11212	a8162597-af98-4abd-92ec-aa4cdee8b760	\N	¡La partida "hhnnhnhhn" comenzó! Hacé clic para jugar.	t	2026-06-11 23:30:39.600369+00
673c82b6-9b66-431c-a6c8-6e8e84b54c87	ce8137fb-b064-44ca-b311-8873ed80760f	\N	¡La partida "hhnnhnhhn" comenzó! Hacé clic para jugar.	t	2026-06-11 23:30:39.919611+00
\.


--
-- Data for Name: partida_jugador; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partida_jugador (id, partida_id, usuario_id, orden_turno, puntos, created_at, esta_dentro, color, lider, tropas_por_colocar) FROM stdin;
7c7d7930-a9f7-46bd-8152-74c987f03f3f	ede0b0ad-4aab-4361-8ff0-a4721a7c4184	a8162597-af98-4abd-92ec-aa4cdee8b760	1	0	2026-06-11 01:39:25.297317+00	t	rgb(32, 161, 80)	Hugo Chavez	0
5b5de610-c3af-43a6-81dc-a77241a5ed64	83064d0d-84a4-4eb4-8d4b-a66c911b38a1	ce8137fb-b064-44ca-b311-8873ed80760f	0	0	2026-06-11 23:39:59.739045+00	f	\N	\N	0
a2052661-dd70-4495-8e9b-591f47359f64	ede0b0ad-4aab-4361-8ff0-a4721a7c4184	b9eabdb4-bf05-4581-9f3f-1a28bf7128fa	0	0	2026-06-11 01:39:17.330569+00	t	rgb(185, 28, 28)	Idi Amin	0
e7e9f950-2361-4b20-9e5a-88feea750f6c	f0c89ceb-2304-4626-92f5-d115f9adba1e	ce8137fb-b064-44ca-b311-8873ed80760f	0	0	2026-06-11 02:31:20.273694+00	t	rgb(200, 71, 249)	Alberto Fernandez	10
424e7e42-b6c5-42da-a6a6-43eac9e8482f	f0c89ceb-2304-4626-92f5-d115f9adba1e	a8162597-af98-4abd-92ec-aa4cdee8b760	1	0	2026-06-11 02:31:31.854721+00	t	rgb(255, 182, 77)	Mauricio Macri	0
117571cc-c03b-45d7-a702-c1180d48be29	83064d0d-84a4-4eb4-8d4b-a66c911b38a1	4c8744f3-c044-49c3-a42e-97bac2bd7265	1	0	2026-06-12 02:17:17.031085+00	f	\N	\N	0
61d47e61-f308-4df2-9b6a-ca5dd23dc0c4	c6c0dc1d-86b6-425f-9d72-9594f17d5116	a8162597-af98-4abd-92ec-aa4cdee8b760	1	0	2026-06-11 23:42:44.359776+00	t	rgb(57, 93, 194)	Mauricio Macri	0
b8094d39-b705-4d8a-8df9-f55e41731958	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	a8162597-af98-4abd-92ec-aa4cdee8b760	0	0	2026-06-12 02:17:44.812369+00	t	rgb(200, 71, 249)	Saddam Hussein	0
e5c479a7-6b72-4d3e-b749-3f551ae7c988	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	4c8744f3-c044-49c3-a42e-97bac2bd7265	1	0	2026-06-12 02:17:49.179723+00	t	rgb(205, 205, 205)	Mauricio Macri	0
99393264-c386-494d-897c-5948513e872f	0b3d9401-1aca-4284-acbc-94b02ff79399	ce8137fb-b064-44ca-b311-8873ed80760f	1	0	2026-06-11 03:31:03.881682+00	t	rgb(32, 161, 80)	Hugo Chavez	0
c865f54c-df03-47f8-9709-ca89495316d9	0b3d9401-1aca-4284-acbc-94b02ff79399	a8162597-af98-4abd-92ec-aa4cdee8b760	0	0	2026-06-11 03:30:58.679967+00	t	rgb(200, 71, 249)	Idi Amin	0
85f1ebfc-6ef2-40df-a0c9-0fbef5ccc155	c6c0dc1d-86b6-425f-9d72-9594f17d5116	4c8744f3-c044-49c3-a42e-97bac2bd7265	0	0	2026-06-11 23:42:22.801256+00	t	rgb(252, 101, 39)	Iósif Staline	0
\.


--
-- Data for Name: suscripcion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suscripcion (id, usuario_id, producto_id, fecha_inicio, fecha_fin, created_at) FROM stdin;
68d40ac2-7628-4c10-b9c9-57d457db326a	a8162597-af98-4abd-92ec-aa4cdee8b760	ace0f9e4-cfd0-48de-8c9e-192749b2e6bf	2026-06-06	\N	2027-06-06 22:28:51+00
3035e0f2-7a9d-4ef2-90a7-123d8fcb2770	aff743af-2352-4997-93b3-42d8859dfd7e	ace0f9e4-cfd0-48de-8c9e-192749b2e6bf	2026-06-06	\N	2027-06-06 22:29:26+00
db21c688-80b0-4852-9f48-471941a740ec	b9eabdb4-bf05-4581-9f3f-1a28bf7128fa	ace0f9e4-cfd0-48de-8c9e-192749b2e6bf	2026-06-06	\N	2027-06-06 22:29:47+00
d5915ec7-dc64-4b4c-be74-c590a33f930d	4c8744f3-c044-49c3-a42e-97bac2bd7265	ace0f9e4-cfd0-48de-8c9e-192749b2e6bf	2026-06-06	\N	2027-06-07 02:59:11+00
1a079dde-2250-41b0-87e1-e8e80d4ee575	ce8137fb-b064-44ca-b311-8873ed80760f	ace0f9e4-cfd0-48de-8c9e-192749b2e6bf	2026-06-07	\N	2027-06-07 03:15:19+00
070861bd-475d-45ad-a1f6-c64abdb718ea	e4952765-2fcf-44b7-8821-13c99353b5e9	ace0f9e4-cfd0-48de-8c9e-192749b2e6bf	2026-06-10	\N	2026-06-21 22:42:27+00
\.


--
-- Data for Name: territorio_estado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.territorio_estado (id, partida_id, territorio_id, usuario_id, tropas) FROM stdin;
be5ae79f-f3a2-4f3d-be5c-723700077a9c	f0c89ceb-2304-4626-92f5-d115f9adba1e	mongolia	ce8137fb-b064-44ca-b311-8873ed80760f	1
8241c6ec-d861-4dae-ba90-a01f05171e66	f0c89ceb-2304-4626-92f5-d115f9adba1e	irkutsk	ce8137fb-b064-44ca-b311-8873ed80760f	1
fa91c032-469e-4d27-847b-ca386a98e6b6	f0c89ceb-2304-4626-92f5-d115f9adba1e	indonesia	ce8137fb-b064-44ca-b311-8873ed80760f	1
c0d03952-20bc-4775-b884-2299c78ac9af	f0c89ceb-2304-4626-92f5-d115f9adba1e	middle_east	a8162597-af98-4abd-92ec-aa4cdee8b760	1
7bbe3f58-b9b8-4dcb-8785-4ce20b265d03	f0c89ceb-2304-4626-92f5-d115f9adba1e	western_australia	ce8137fb-b064-44ca-b311-8873ed80760f	1
126fc044-52cd-408f-a990-d92fdcbf956b	f0c89ceb-2304-4626-92f5-d115f9adba1e	peru	a8162597-af98-4abd-92ec-aa4cdee8b760	1
783c7b0f-cfe4-4d52-bcda-764b9a1d53e1	f0c89ceb-2304-4626-92f5-d115f9adba1e	india	ce8137fb-b064-44ca-b311-8873ed80760f	1
da1c6c88-8bf8-478b-84ca-3d66633e8f0a	f0c89ceb-2304-4626-92f5-d115f9adba1e	iceland	a8162597-af98-4abd-92ec-aa4cdee8b760	1
460c8b07-e39b-43c3-9434-d40b653a231b	f0c89ceb-2304-4626-92f5-d115f9adba1e	egypt	ce8137fb-b064-44ca-b311-8873ed80760f	1
d4e7bfb6-709c-4656-af3c-7dfa759802ff	f0c89ceb-2304-4626-92f5-d115f9adba1e	congo	a8162597-af98-4abd-92ec-aa4cdee8b760	1
781b61d8-85f3-4eca-a625-f2ab10bfa352	f0c89ceb-2304-4626-92f5-d115f9adba1e	ukraine	a8162597-af98-4abd-92ec-aa4cdee8b760	1
4a67280f-e602-4ce5-94f6-4dc046b85564	f0c89ceb-2304-4626-92f5-d115f9adba1e	venezuela	ce8137fb-b064-44ca-b311-8873ed80760f	1
67ac39bf-50ae-4f54-95bc-3e524f943766	f0c89ceb-2304-4626-92f5-d115f9adba1e	greenland	a8162597-af98-4abd-92ec-aa4cdee8b760	1
c14a9446-72ad-46b7-9f9f-8de83c39fe48	f0c89ceb-2304-4626-92f5-d115f9adba1e	japan	a8162597-af98-4abd-92ec-aa4cdee8b760	1
dcd902b1-1e78-4585-8f68-5eb66f83fb40	f0c89ceb-2304-4626-92f5-d115f9adba1e	ontario	ce8137fb-b064-44ca-b311-8873ed80760f	1
2358ea65-d06d-4a75-aaab-038c6ab7c38a	f0c89ceb-2304-4626-92f5-d115f9adba1e	argentina	a8162597-af98-4abd-92ec-aa4cdee8b760	1
d10276cb-f6c4-4010-8222-5eaa021ddaf5	f0c89ceb-2304-4626-92f5-d115f9adba1e	china	ce8137fb-b064-44ca-b311-8873ed80760f	1
592e9219-ca66-42b4-ae11-9c9ed92544be	f0c89ceb-2304-4626-92f5-d115f9adba1e	south_africa	a8162597-af98-4abd-92ec-aa4cdee8b760	1
3227f7a0-67b0-4e8d-bb8e-154d1fe91d03	f0c89ceb-2304-4626-92f5-d115f9adba1e	madagascar	ce8137fb-b064-44ca-b311-8873ed80760f	1
e4d1754c-6e7a-422c-bcd1-189c6732d6e5	f0c89ceb-2304-4626-92f5-d115f9adba1e	new_guinea	a8162597-af98-4abd-92ec-aa4cdee8b760	1
4fda1a39-a38a-4534-bd64-bfcedff30e83	f0c89ceb-2304-4626-92f5-d115f9adba1e	siam	ce8137fb-b064-44ca-b311-8873ed80760f	1
4866a37f-8540-45a3-8a2f-e8335be53606	f0c89ceb-2304-4626-92f5-d115f9adba1e	ural	a8162597-af98-4abd-92ec-aa4cdee8b760	1
5f314683-2e41-449f-9b3b-e66c7362c945	f0c89ceb-2304-4626-92f5-d115f9adba1e	scandinavia	a8162597-af98-4abd-92ec-aa4cdee8b760	1
8b27a407-8232-4fbc-bba7-46b3d3f89451	f0c89ceb-2304-4626-92f5-d115f9adba1e	afghanistan	ce8137fb-b064-44ca-b311-8873ed80760f	1
e8c5e814-cb94-4de4-bb95-4a69dd829dce	f0c89ceb-2304-4626-92f5-d115f9adba1e	southern_europe	ce8137fb-b064-44ca-b311-8873ed80760f	1
5a0688ea-086f-45f5-bbe7-16118eafa096	f0c89ceb-2304-4626-92f5-d115f9adba1e	eastern_australia	a8162597-af98-4abd-92ec-aa4cdee8b760	1
e27d7cb1-7a14-4b12-89b0-846db7fb78b6	f0c89ceb-2304-4626-92f5-d115f9adba1e	great_britain	ce8137fb-b064-44ca-b311-8873ed80760f	1
46d0c5f0-1b82-45f7-89e7-5d39d698dff0	f0c89ceb-2304-4626-92f5-d115f9adba1e	yakutsk	a8162597-af98-4abd-92ec-aa4cdee8b760	1
bd399e56-bd9a-4f2d-8ac4-470fbd833c03	f0c89ceb-2304-4626-92f5-d115f9adba1e	east_africa	a8162597-af98-4abd-92ec-aa4cdee8b760	2
e0877f75-2b92-4fe5-918f-2cb90fe9ac51	f0c89ceb-2304-4626-92f5-d115f9adba1e	north_africa	ce8137fb-b064-44ca-b311-8873ed80760f	2
9c1aa29f-0dfb-4301-881e-b641c8e76985	f0c89ceb-2304-4626-92f5-d115f9adba1e	brazil	ce8137fb-b064-44ca-b311-8873ed80760f	2
25b16cdc-dc54-4b63-ad94-5e31a5a13aec	f0c89ceb-2304-4626-92f5-d115f9adba1e	alberta	ce8137fb-b064-44ca-b311-8873ed80760f	1
3bd32220-737f-4703-ae1a-586d734b74f7	f0c89ceb-2304-4626-92f5-d115f9adba1e	alaska	ce8137fb-b064-44ca-b311-8873ed80760f	1
6ddd1203-35a4-482c-b5b5-fdd2a11e5842	0b3d9401-1aca-4284-acbc-94b02ff79399	western_united_states	ce8137fb-b064-44ca-b311-8873ed80760f	5
15df76aa-559f-4c19-a3ad-5d7c7a491d6e	f0c89ceb-2304-4626-92f5-d115f9adba1e	eastern_united_states	ce8137fb-b064-44ca-b311-8873ed80760f	1
269f42e1-36e5-4f82-b15e-84a0ef2b9a9b	0b3d9401-1aca-4284-acbc-94b02ff79399	eastern_united_states	ce8137fb-b064-44ca-b311-8873ed80760f	7
a772042e-28ac-4ac3-bee1-ab81b98283ab	f0c89ceb-2304-4626-92f5-d115f9adba1e	northwest_territory	ce8137fb-b064-44ca-b311-8873ed80760f	2
7907c741-18df-4e3e-9e9f-8f9f43a23151	f0c89ceb-2304-4626-92f5-d115f9adba1e	kamchatka	ce8137fb-b064-44ca-b311-8873ed80760f	2
0440150c-4557-49dd-bfe8-09d9e13e0f0b	f0c89ceb-2304-4626-92f5-d115f9adba1e	siberia	ce8137fb-b064-44ca-b311-8873ed80760f	2
ed7d54a8-0d6e-424a-9d5b-8e5fe859392d	f0c89ceb-2304-4626-92f5-d115f9adba1e	quebec	a8162597-af98-4abd-92ec-aa4cdee8b760	4
7f6cc1c4-15db-4fd5-8b7e-8d4d2791623b	f0c89ceb-2304-4626-92f5-d115f9adba1e	western_europe	a8162597-af98-4abd-92ec-aa4cdee8b760	5
94b9fa23-68fa-4d62-bd26-9dbc870a6017	f0c89ceb-2304-4626-92f5-d115f9adba1e	western_united_states	a8162597-af98-4abd-92ec-aa4cdee8b760	1
c07068c5-7ea9-4435-848e-e48065802695	f0c89ceb-2304-4626-92f5-d115f9adba1e	central_america	a8162597-af98-4abd-92ec-aa4cdee8b760	2
9861f43d-3838-4f08-b541-bfed9844e773	0b3d9401-1aca-4284-acbc-94b02ff79399	southern_europe	a8162597-af98-4abd-92ec-aa4cdee8b760	1
de84d4a1-ead6-4a7f-bb0a-34d778f6470f	0b3d9401-1aca-4284-acbc-94b02ff79399	scandinavia	ce8137fb-b064-44ca-b311-8873ed80760f	1
aab7ef95-f5c1-4a3d-9035-111dfbcc5fb4	0b3d9401-1aca-4284-acbc-94b02ff79399	western_australia	a8162597-af98-4abd-92ec-aa4cdee8b760	1
bf305b59-97f6-4f5b-82b2-1fc006e26f5d	0b3d9401-1aca-4284-acbc-94b02ff79399	japan	ce8137fb-b064-44ca-b311-8873ed80760f	1
b073eac9-cff9-4979-a4ce-1b936137ac00	0b3d9401-1aca-4284-acbc-94b02ff79399	greenland	a8162597-af98-4abd-92ec-aa4cdee8b760	1
aba1fadc-625c-4ae5-b1ca-2d868b35bbad	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	middle_east	a8162597-af98-4abd-92ec-aa4cdee8b760	1
e696d0aa-c6b2-4fea-ae72-a749c19c8165	0b3d9401-1aca-4284-acbc-94b02ff79399	east_africa	a8162597-af98-4abd-92ec-aa4cdee8b760	1
7708a0a6-712c-41ce-a3d5-760e2ce98ea6	0b3d9401-1aca-4284-acbc-94b02ff79399	central_america	ce8137fb-b064-44ca-b311-8873ed80760f	1
b51a0135-e339-4325-ac34-4559168bd8df	0b3d9401-1aca-4284-acbc-94b02ff79399	argentina	a8162597-af98-4abd-92ec-aa4cdee8b760	1
193bfc0c-a3d3-43ae-b08f-6cf96649cd89	0b3d9401-1aca-4284-acbc-94b02ff79399	ural	ce8137fb-b064-44ca-b311-8873ed80760f	1
e54ab085-aa9d-400b-89f2-ea34a9d571b8	0b3d9401-1aca-4284-acbc-94b02ff79399	siam	a8162597-af98-4abd-92ec-aa4cdee8b760	1
6937f1cb-2c7c-4c5b-a5c0-041ce189ffc4	0b3d9401-1aca-4284-acbc-94b02ff79399	siberia	ce8137fb-b064-44ca-b311-8873ed80760f	1
5f281206-6702-4082-89c9-2f522a76a1d6	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	alberta	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
f41238d7-ab4f-4bce-afbd-52d327b7bb4b	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	venezuela	a8162597-af98-4abd-92ec-aa4cdee8b760	1
47a1918d-6940-49d7-83e9-279bfeb56b6b	0b3d9401-1aca-4284-acbc-94b02ff79399	middle_east	a8162597-af98-4abd-92ec-aa4cdee8b760	1
bd9e1761-4a27-4915-9aa5-88e6f4ee1c3f	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	east_africa	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
8600d7bb-b454-43c6-9f52-d4aeac0236fb	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	iceland	a8162597-af98-4abd-92ec-aa4cdee8b760	1
90e0b35e-3466-49da-81b5-544601705f78	f0c89ceb-2304-4626-92f5-d115f9adba1e	northern_europe	a8162597-af98-4abd-92ec-aa4cdee8b760	3
3ac59c1b-65d8-4075-8588-7c8640d6032a	0b3d9401-1aca-4284-acbc-94b02ff79399	northern_europe	ce8137fb-b064-44ca-b311-8873ed80760f	1
273ecedc-cc9d-462d-93fe-3f493ab667d5	0b3d9401-1aca-4284-acbc-94b02ff79399	afghanistan	a8162597-af98-4abd-92ec-aa4cdee8b760	1
40846f89-9f48-4058-8171-6817040e64d7	0b3d9401-1aca-4284-acbc-94b02ff79399	western_europe	ce8137fb-b064-44ca-b311-8873ed80760f	1
a4c80158-d0eb-491c-951d-26880383f165	0b3d9401-1aca-4284-acbc-94b02ff79399	iceland	a8162597-af98-4abd-92ec-aa4cdee8b760	1
af9cb9cd-9742-428c-8aac-0f83ca1e04b3	0b3d9401-1aca-4284-acbc-94b02ff79399	congo	ce8137fb-b064-44ca-b311-8873ed80760f	1
a1916ad7-4a65-4ca7-a6ce-e7cb7102882b	0b3d9401-1aca-4284-acbc-94b02ff79399	alaska	a8162597-af98-4abd-92ec-aa4cdee8b760	1
97d81665-a898-4a79-817b-f59c419d4c07	0b3d9401-1aca-4284-acbc-94b02ff79399	quebec	ce8137fb-b064-44ca-b311-8873ed80760f	1
5327f124-6aad-4a1d-ab16-f49555e19e86	0b3d9401-1aca-4284-acbc-94b02ff79399	mongolia	a8162597-af98-4abd-92ec-aa4cdee8b760	1
46e2683a-6c86-423b-802b-935869184e53	0b3d9401-1aca-4284-acbc-94b02ff79399	yakutsk	ce8137fb-b064-44ca-b311-8873ed80760f	1
b01f7890-5d0d-4d4f-831e-73279c019aeb	0b3d9401-1aca-4284-acbc-94b02ff79399	peru	a8162597-af98-4abd-92ec-aa4cdee8b760	1
5bcc0b9f-1d49-452d-992c-dbeba5186d83	0b3d9401-1aca-4284-acbc-94b02ff79399	great_britain	ce8137fb-b064-44ca-b311-8873ed80760f	1
9955c13e-0592-4d80-b6b8-d4b85c6f8834	0b3d9401-1aca-4284-acbc-94b02ff79399	egypt	a8162597-af98-4abd-92ec-aa4cdee8b760	1
6da6455d-7178-4000-b44c-71b0701f2858	0b3d9401-1aca-4284-acbc-94b02ff79399	india	a8162597-af98-4abd-92ec-aa4cdee8b760	1
f73a36b6-9ac8-44c8-989d-b75c189c6950	0b3d9401-1aca-4284-acbc-94b02ff79399	northwest_territory	ce8137fb-b064-44ca-b311-8873ed80760f	1
ed17b3a9-01e1-4cba-9dcf-ab785095535c	0b3d9401-1aca-4284-acbc-94b02ff79399	venezuela	a8162597-af98-4abd-92ec-aa4cdee8b760	1
b03a4879-5242-4e30-aefb-e992e4e0cd54	0b3d9401-1aca-4284-acbc-94b02ff79399	new_guinea	ce8137fb-b064-44ca-b311-8873ed80760f	1
25ba68d1-f07f-4a86-98ea-f2287b4748f8	0b3d9401-1aca-4284-acbc-94b02ff79399	south_africa	a8162597-af98-4abd-92ec-aa4cdee8b760	1
546cb212-4a82-43df-9b09-a59a8e2b7089	0b3d9401-1aca-4284-acbc-94b02ff79399	kamchatka	ce8137fb-b064-44ca-b311-8873ed80760f	1
2981136b-d877-4746-a246-306b6ae17f98	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	southern_europe	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
2503087d-6020-4c1e-989b-08e59d99cd21	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	irkutsk	a8162597-af98-4abd-92ec-aa4cdee8b760	1
827e011c-b27e-4866-bf71-115d1a45f09c	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	eastern_united_states	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
cd93df1a-6247-4742-b0b5-601508215e0c	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	mongolia	a8162597-af98-4abd-92ec-aa4cdee8b760	1
9d248684-c92b-47c3-98ca-6565740654bd	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	brazil	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
11ead7e9-b243-498f-8ed5-d78b78f1d83f	0b3d9401-1aca-4284-acbc-94b02ff79399	irkutsk	a8162597-af98-4abd-92ec-aa4cdee8b760	1
409357d3-52d4-425e-b293-b5dbb27553e6	0b3d9401-1aca-4284-acbc-94b02ff79399	ukraine	ce8137fb-b064-44ca-b311-8873ed80760f	1
48e19cbd-7f95-4c0c-ae66-567de9e3823c	0b3d9401-1aca-4284-acbc-94b02ff79399	ontario	a8162597-af98-4abd-92ec-aa4cdee8b760	1
28be8ddc-325e-4218-9618-c031a8136269	0b3d9401-1aca-4284-acbc-94b02ff79399	eastern_australia	ce8137fb-b064-44ca-b311-8873ed80760f	1
386276b1-d70c-44f6-8dc6-981d96814081	0b3d9401-1aca-4284-acbc-94b02ff79399	indonesia	ce8137fb-b064-44ca-b311-8873ed80760f	1
9d38ec3c-9fc7-4488-bd89-3cace6bb5c07	0b3d9401-1aca-4284-acbc-94b02ff79399	madagascar	ce8137fb-b064-44ca-b311-8873ed80760f	1
c90ac7c3-0348-4e79-9478-b3d7fbff73d9	0b3d9401-1aca-4284-acbc-94b02ff79399	north_africa	a8162597-af98-4abd-92ec-aa4cdee8b760	1
76c81ce3-0ccf-4b32-a144-b2161da92077	0b3d9401-1aca-4284-acbc-94b02ff79399	brazil	ce8137fb-b064-44ca-b311-8873ed80760f	1
ac877ac7-c69a-43b7-8442-61732ea8148e	0b3d9401-1aca-4284-acbc-94b02ff79399	china	a8162597-af98-4abd-92ec-aa4cdee8b760	7
8c2bcf80-8e52-417d-8f21-12fa9bcb9b92	0b3d9401-1aca-4284-acbc-94b02ff79399	alberta	a8162597-af98-4abd-92ec-aa4cdee8b760	5
19f3140e-120d-4f3a-9da5-579425db8d0f	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	great_britain	a8162597-af98-4abd-92ec-aa4cdee8b760	1
5396459d-06d7-4239-8069-4078f34e34d3	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	western_europe	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
0a20a9aa-95e5-40c3-bd40-59529dd46cd5	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	egypt	a8162597-af98-4abd-92ec-aa4cdee8b760	1
4ad26d69-544e-4ab6-823f-744eb9b1801c	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	madagascar	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
33a33d53-ff93-4e93-b962-fa829739bc25	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	western_australia	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
862a46a0-877c-4b50-b5b6-4ca8b06d3739	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	ukraine	a8162597-af98-4abd-92ec-aa4cdee8b760	1
ad3755d5-21b2-4f51-b3ed-e9d8483e489b	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	northwest_territory	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
501a6dad-3c04-467f-9c30-a842e4debe63	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	western_united_states	a8162597-af98-4abd-92ec-aa4cdee8b760	1
b7f4eea4-7a73-4f6f-9d17-4b74e89fbd4b	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	indonesia	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
3e29bc56-23c4-4fc2-9c69-a2c5c85783cb	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	ontario	a8162597-af98-4abd-92ec-aa4cdee8b760	1
9ad1fb0b-b888-4b1c-a1ce-97ccf772c492	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	quebec	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
c6a14149-4a8c-4382-a8bb-644ffd6f03fc	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	china	a8162597-af98-4abd-92ec-aa4cdee8b760	1
4b6b0bfc-8b59-45dc-8230-24ee25c4f528	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	eastern_australia	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
8f7ac8c4-1254-422e-a6c5-c2b2991ddc59	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	siberia	a8162597-af98-4abd-92ec-aa4cdee8b760	1
2d799edd-d31b-4769-b80c-aee246c0cc14	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	alaska	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
da16ddbb-c52e-46ef-bb5e-926c838ce6be	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	greenland	a8162597-af98-4abd-92ec-aa4cdee8b760	1
fc450bb5-8a71-4127-9cd7-d0707c58cd32	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	kamchatka	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
9293eb18-e5c9-433c-b879-1e082a2c6324	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	argentina	a8162597-af98-4abd-92ec-aa4cdee8b760	1
e96fba6e-c0ad-4729-84f9-ca0877659494	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	south_africa	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
5d3da2e5-e87d-46f9-86a1-ed32560795ae	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	japan	a8162597-af98-4abd-92ec-aa4cdee8b760	1
550aa85b-fc0f-41fb-9f06-da65c2678535	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	northern_europe	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
a2420f20-4911-4308-8a56-3f1bf70751b7	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	new_guinea	a8162597-af98-4abd-92ec-aa4cdee8b760	1
ae87e934-e49f-4c48-827e-2e0869203ca6	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	ural	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
f5bba012-f0da-4fbf-a54e-9f6b8ec16e31	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	scandinavia	a8162597-af98-4abd-92ec-aa4cdee8b760	1
2e08fab6-5642-491a-98e5-5fc9e5e1ccf7	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	afghanistan	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
afbdba4c-7757-47e5-b908-ffe6654a8b03	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	siam	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
f4d4134c-2ae1-4158-82a1-53859005102d	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	yakutsk	a8162597-af98-4abd-92ec-aa4cdee8b760	1
edb1e2db-23d7-49fc-8043-4e3e20dadceb	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	central_america	4c8744f3-c044-49c3-a42e-97bac2bd7265	1
ecd8be9d-2345-4d26-96b7-d74a5f854a27	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	india	a8162597-af98-4abd-92ec-aa4cdee8b760	1
1d29da8d-86a2-486b-a8e2-2d4492306aa0	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	peru	a8162597-af98-4abd-92ec-aa4cdee8b760	6
eeba1f29-1cba-44a6-98a5-094ec79d0bdf	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	north_africa	4c8744f3-c044-49c3-a42e-97bac2bd7265	4
9065850a-0c99-4636-8378-52a0ab74a922	81c2d5fc-a8e4-4b28-80dd-623e18f528cf	congo	a8162597-af98-4abd-92ec-aa4cdee8b760	1
\.


--
-- Data for Name: turno; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.turno (id, partida_id, usuario_id, numero_a, numero_b, respuesta_correcta, respuesta_ingresada, es_correcto, respondido_en, created_at) FROM stdin;
c4891eff-076d-4034-8e03-03d1a49449f5	ede0b0ad-4aab-4361-8ff0-a4721a7c4184	b9eabdb4-bf05-4581-9f3f-1a28bf7128fa	0	0	0	\N	\N	\N	2026-06-11 01:48:43.699022+00
\.


--
-- Data for Name: messages_2026_06_09; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2026_06_09 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_06_10; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2026_06_10 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_06_11; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2026_06_11 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_06_12; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2026_06_12 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_06_13; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2026_06_13 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_06_14; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2026_06_14 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_06_15; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2026_06_15 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-06-06 21:08:30
20211116045059	2026-06-06 21:08:30
20211116050929	2026-06-06 21:08:30
20211116051442	2026-06-06 21:08:30
20211116212300	2026-06-06 21:08:31
20211116213355	2026-06-06 21:08:31
20211116213934	2026-06-06 21:08:31
20211116214523	2026-06-06 21:08:31
20211122062447	2026-06-06 21:08:31
20211124070109	2026-06-06 21:08:32
20211202204204	2026-06-06 21:08:32
20211202204605	2026-06-06 21:08:32
20211210212804	2026-06-06 21:08:33
20211228014915	2026-06-06 21:08:33
20220107221237	2026-06-06 21:08:33
20220228202821	2026-06-06 21:08:33
20220312004840	2026-06-06 21:08:33
20220603231003	2026-06-06 21:08:34
20220603232444	2026-06-06 21:08:34
20220615214548	2026-06-06 21:08:34
20220712093339	2026-06-06 21:08:34
20220908172859	2026-06-06 21:08:34
20220916233421	2026-06-06 21:08:35
20230119133233	2026-06-06 21:08:35
20230128025114	2026-06-06 21:08:35
20230128025212	2026-06-06 21:08:35
20230227211149	2026-06-06 21:08:36
20230228184745	2026-06-06 21:08:36
20230308225145	2026-06-06 21:08:36
20230328144023	2026-06-06 21:08:36
20231018144023	2026-06-06 21:08:36
20231204144023	2026-06-06 21:08:37
20231204144024	2026-06-06 21:08:37
20231204144025	2026-06-06 21:08:37
20240108234812	2026-06-06 21:08:37
20240109165339	2026-06-06 21:08:37
20240227174441	2026-06-06 21:08:38
20240311171622	2026-06-06 21:08:38
20240321100241	2026-06-06 21:08:38
20240401105812	2026-06-06 21:08:39
20240418121054	2026-06-06 21:08:39
20240523004032	2026-06-06 21:08:40
20240618124746	2026-06-06 21:08:40
20240801235015	2026-06-06 21:08:40
20240805133720	2026-06-06 21:08:40
20240827160934	2026-06-06 21:08:41
20240919163303	2026-06-06 21:08:41
20240919163305	2026-06-06 21:08:41
20241019105805	2026-06-06 21:08:41
20241030150047	2026-06-06 21:08:42
20241108114728	2026-06-06 21:08:42
20241121104152	2026-06-06 21:08:42
20241130184212	2026-06-06 21:08:43
20241220035512	2026-06-06 21:08:43
20241220123912	2026-06-06 21:08:43
20241224161212	2026-06-06 21:08:43
20250107150512	2026-06-06 21:08:43
20250110162412	2026-06-06 21:08:44
20250123174212	2026-06-06 21:08:44
20250128220012	2026-06-06 21:08:44
20250506224012	2026-06-06 21:08:44
20250523164012	2026-06-06 21:08:44
20250714121412	2026-06-06 21:08:45
20250905041441	2026-06-06 21:08:45
20251103001201	2026-06-06 21:08:45
20251120212548	2026-06-06 21:08:45
20251120215549	2026-06-06 21:08:45
20260218120000	2026-06-06 21:08:46
20260326120000	2026-06-06 21:08:46
20260514120000	2026-06-06 21:08:46
20260527120000	2026-06-06 21:08:46
20260528120000	2026-06-06 21:08:47
20260603120000	2026-06-06 21:08:47
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter, selected_columns) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-06-06 18:33:42.360791
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-06-06 18:33:42.401963
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-06-06 18:33:42.405313
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-06-06 18:33:42.427082
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-06-06 18:33:42.437188
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-06-06 18:33:42.439871
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-06-06 18:33:42.442692
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-06-06 18:33:42.446728
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-06-06 18:33:42.450482
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-06-06 18:33:42.453929
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-06-06 18:33:42.457561
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-06-06 18:33:42.463464
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-06-06 18:33:42.467139
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-06-06 18:33:42.470775
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-06-06 18:33:42.474488
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-06-06 18:33:42.498448
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-06-06 18:33:42.50162
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-06-06 18:33:42.505476
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-06-06 18:33:42.50909
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-06-06 18:33:42.513187
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-06-06 18:33:42.516034
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-06-06 18:33:42.520726
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-06-06 18:33:42.536088
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-06-06 18:33:42.544274
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-06-06 18:33:42.548686
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-06-06 18:33:42.552027
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-06-06 18:33:42.554711
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-06-06 18:33:42.556944
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-06-06 18:33:42.559003
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-06-06 18:33:42.561105
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-06-06 18:33:42.563319
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-06-06 18:33:42.565501
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-06-06 18:33:42.567592
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-06-06 18:33:42.569801
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-06-06 18:33:42.572908
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-06-06 18:33:42.575135
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-06-06 18:33:42.577382
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-06-06 18:33:42.579726
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-06-06 18:33:42.582738
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-06-06 18:33:42.592036
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-06-06 18:33:42.595449
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-06-06 18:33:42.597997
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-06-06 18:33:42.600537
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-06-06 18:33:42.603988
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-06-06 18:33:42.606355
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-06-06 18:33:42.609575
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-06-06 18:33:42.617791
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-06-06 18:33:42.620592
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-06-06 18:33:42.622945
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-06-06 18:33:42.638543
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-06-06 18:33:42.642246
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-06-06 18:33:43.354525
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-06-06 18:33:43.356217
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-06-06 18:33:43.363246
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-06-06 18:33:43.364966
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-06-06 18:33:43.366478
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-06-06 18:33:43.369927
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-06-06 18:33:43.373776
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-06-06 18:33:43.376554
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-06-06 18:33:43.379754
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-06-06 18:33:43.382551
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 182, true);


--
-- Name: jobid_seq; Type: SEQUENCE SET; Schema: cron; Owner: supabase_admin
--

SELECT pg_catalog.setval('cron.jobid_seq', 1, true);


--
-- Name: runid_seq; Type: SEQUENCE SET; Schema: cron; Owner: supabase_admin
--

SELECT pg_catalog.setval('cron.runid_seq', 286, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 5829, true);


--
-- PostgreSQL database dump complete
--

\unrestrict ohPCO8eTwpgu35MrxqwuWRMHzRkfABMPvtmnWVHOT4WYCwUQgoh4i6TDaqyQfhR

