package com.diamonds;

import com.diamonds.model.Room;
import com.diamonds.repository.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import java.util.Arrays;

@SpringBootApplication
public class DiamondsApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiamondsApplication.class, args);
    }

    @Bean
    CommandLineRunner runner(RoomRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.saveAll(Arrays.asList(
                    Room.builder().number("101").name("Estandar Simple").type(Room.RoomType.ESTANDAR).price(50.0).duration(6).status(Room.RoomStatus.VACANT).amenities(Arrays.asList("TV", "AC", "Wi-Fi")).build(),
                    Room.builder().number("VIP1").name("VIP Suite").type(Room.RoomType.VIP).price(100.0).duration(12).status(Room.RoomStatus.VACANT).amenities(Arrays.asList("Jacuzzi", "TV 4K", "AC")).build(),
                    Room.builder().number("SVIP1").name("Super VIP Loft").type(Room.RoomType.SUPERVIP).price(150.0).duration(24).status(Room.RoomStatus.VACANT).amenities(Arrays.asList("Jacuzzi", "Bar", "Balcón")).build()
                ));
                System.out.println("Base de datos inicializada con habitaciones de prueba.");
            }
        };
    }
}
