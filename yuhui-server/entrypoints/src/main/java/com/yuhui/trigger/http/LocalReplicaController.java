package com.yuhui.trigger.http;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.core.io.FileSystemResource;
import java.nio.file.*;
import java.util.*;
@RestController
@Profile("local")
public class LocalReplicaController {
    @GetMapping("/user/me") public Map<String,Object> me() {
        return Map.of("code",1000,"message","成功","data",Map.of("id","10002","username","渝惠体验客户","roles",List.of("ROLE_ADMIN"),"permissions",List.of()));
    }
    @GetMapping("/local/uploads/{name}") public ResponseEntity<FileSystemResource> image(@PathVariable String name) throws Exception {
        if (!name.matches("[0-9a-f-]+\\.(png|jpg|jpeg|gif|webp)")) return ResponseEntity.notFound().build();
        Path p=Path.of(".runtime/uploads").resolve(name);
        if (!Files.isRegularFile(p)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(Optional.ofNullable(Files.probeContentType(p)).orElse("application/octet-stream"))).body(new FileSystemResource(p));
    }
}
