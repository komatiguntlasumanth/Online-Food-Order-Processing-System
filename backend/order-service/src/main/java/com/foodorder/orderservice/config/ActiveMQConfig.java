package com.foodorder.orderservice.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jms.annotation.EnableJms;
import org.springframework.jms.support.converter.MappingJackson2MessageConverter;
import org.springframework.jms.support.converter.MessageConverter;
import org.springframework.jms.support.converter.MessageType;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableJms
public class ActiveMQConfig {

// Removed embedded broker bean to use the external ActiveMQ broker instead.

    @Bean
    public MessageConverter jacksonJmsMessageConverter() {
        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setTargetType(MessageType.TEXT);
        converter.setTypeIdPropertyName("_type");
        
        // Define type mapping for serialization/deserialization safety
        Map<String, Class<?>> typeIdMappings = new HashMap<>();
        typeIdMappings.put("Map", Map.class);
        typeIdMappings.put("HashMap", HashMap.class);
        converter.setTypeIdMappings(typeIdMappings);
        
        return converter;
    }
}
