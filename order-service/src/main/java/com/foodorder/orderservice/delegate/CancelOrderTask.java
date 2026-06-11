package com.foodorder.orderservice.delegate;

import com.foodorder.orderservice.repository.OrderRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("cancelOrderTask")
public class CancelOrderTask implements JavaDelegate {

    @Autowired
    private OrderRepository orderRepository;

    @Override
    @SuppressWarnings("null")
    public void execute(DelegateExecution execution) throws Exception {
        Long orderId = (Long) execution.getVariable("orderId");
        System.out.println("[OrderService] Delegate: Cancelling Order #" + orderId + " due to payment failure.");

        orderRepository.findById(orderId).ifPresent(order -> {
            order.setStatus("CANCELLED");
            orderRepository.save(order);
        });
        System.out.println("[OrderService] Order #" + orderId + " - CANCELLED");
    }
}
