package com.school.portal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class StudentPortalApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
	}

	@Test
	void builtInAdminAndOfficeCredentialsCanLogIn() throws Exception {
		assertLogin("admin", "admin123", "ADMIN");
		assertLogin("office", "office123", "OFFICE");
	}

	@Test
	void failedBasicAuthenticationDoesNotTriggerBrowserPopup() throws Exception {
		String invalidCredentials = Base64.getEncoder().encodeToString(
				"admin:wrong-password".getBytes(StandardCharsets.UTF_8));

		mockMvc.perform(get("/admin/api/popup-check")
				.header(HttpHeaders.AUTHORIZATION, "Basic " + invalidCredentials))
				.andExpect(status().isUnauthorized())
				.andExpect(header().doesNotExist(HttpHeaders.WWW_AUTHENTICATE));
	}

	private void assertLogin(String username, String password, String role) throws Exception {
		mockMvc.perform(post("/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"username":"%s","password":"%s"}
						""".formatted(username, password)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.username").value(username))
				.andExpect(jsonPath("$.role").value(role));
	}

}
