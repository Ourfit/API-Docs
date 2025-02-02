window.onload = function () {
    //<editor-fold desc="Changeable Configuration Block">

    // the following lines will be replaced by docker/configurator, when it runs in a docker-container
    window.ui = SwaggerUIBundle({
        urls: [{url: "./openapi/schemas.yaml", name: "Common Schema"}, {url: "./openapi/v1_user.yaml", name: "User API"}, {url: "./openapi/v1_auth.yaml", name: "Auth API"}, {url: "./openapi/v1_found.yaml", name: "Found Item API"}, {url: "./openapi/v1_lost.yaml", name: "Lost Item API"}, {url: "./openapi/v1_common.yaml", name: "Common API"}, {url: "./openapi/v1_admin.yaml", name: "Admin API"}],
        dom_id: '#swagger-ui',
        deepLinking: true,
        docExpansion: 'full',
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
        ],
        plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
    });

    //</editor-fold>
};
