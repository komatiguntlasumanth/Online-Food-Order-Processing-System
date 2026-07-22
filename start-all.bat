@echo off
echo ==========================================================
echo  Online Food Ordering System - Multi-Terminal Launcher
echo ==========================================================
echo.
echo Starting ActiveMQ Broker...
start "ActiveMQ Broker" cmd /k "cd backend\activemq-local\apache-activemq-5.18.4\bin && activemq.bat console"

echo Waiting 5 seconds for ActiveMQ to initialize...
timeout /t 5 > nul

echo Starting Order Service (Port 8080)...
start "Order Service" cmd /k "cd backend && mvn -pl order-service spring-boot:run"

echo Starting Payment Service (Port 8081)...
start "Payment Service" cmd /k "cd backend && mvn -pl payment-service spring-boot:run"

echo Starting Kitchen Service (Port 8082)...
start "Kitchen Service" cmd /k "cd backend && mvn -pl kitchen-service spring-boot:run"

echo Starting Delivery Service (Port 8083)...
start "Delivery Service" cmd /k "cd backend && mvn -pl delivery-service spring-boot:run"

echo Starting React UI (Port 5173)...
start "React UI" cmd /k "cd frontend\food-delivery-ui && npm run dev"

echo.
echo ==========================================================
echo  SUCCESS: All services have been launched in separate cmd windows!
echo ==========================================================
pause
