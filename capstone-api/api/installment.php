<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class User
{
    // login
    function GetInstallment($json)
    {
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'
        $json = json_decode($json, true);
        $sql = "SELECT 
                a.installment_sales_id, 
                a.invoice_id, 
                a.dp_amount, 
                a.dp_percentage, 
                a.total_amount, 
                a.interest_percentage, 
                a.interest_amount, 
                a.remaining_bal, 
                a.total_payment, 
                a.payment_plan, 
                a.total_sales_amount, 
                a.balance, 
                a.monthly_payment, 
                a.cust_id, 
                d.cust_name, 
                a.status, 
                b.date, 
                b.time, 
                b.location_id, 
                c.location_name, 
                b.account_id, 
                e.fname, 
                e.mname, 
                e.lname
            FROM installment_sales a
            JOIN invoice b ON a.invoice_id = b.invoice_id
            JOIN location c ON c.location_id = b.location_id
            JOIN customers d ON d.cust_id = a.cust_id
            JOIN account e ON e.account_id = b.account_id
            ORDER BY a.installment_sales_id ASC;  
            ";

        $stmt = $conn->prepare($sql);
        // $stmt->bindParam(':username', $json['username']);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function GetInstallmentD($json)
    {
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'

        $json = json_decode($json, true);
        $sql = "SELECT `ips_id`, `installment_id`, `due_date`, `payment_number`, 
                `amount_due`, `status` FROM `installment_payment_sched` WHERE installment_id = :ID AND status = 'UNPAID'
                ORDER BY payment_number ASC";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam('ID', $json['installmentID']);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function GetInstallmentD1($json)
    {
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'

        $json = json_decode($json, true);
        $sql = "SELECT `ips_id`, `installment_id`, `due_date`, `payment_number`, 
                `amount_due`, `status` FROM `installment_payment_sched` 
                ORDER BY payment_number ASC";

        $stmt = $conn->prepare($sql);
        // $stmt->bindParam('ID', $json['installmentID']);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function GetAllInstallmentD($json)
    {
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'

        $json = json_decode($json, true);
        $sql = "SELECT 
                    a.`ips_id`, 
                    a.`installment_id`, 
                    a.`due_date`, 
                    a.`payment_number`, 
                    a.`amount_due`, 
                    a.`status`, 
                    b.`cust_id`
                FROM `installment_payment_sched` a
                INNER JOIN `installment_sales` b 
                    ON a.`installment_id` = b.`installment_sales_id`
                ;
                ";

        $stmt = $conn->prepare($sql);

        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function PayInstallment($json, $paymentToRecord)
    {
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'

        try {
            $json = json_decode($json, true);
            $paymentsArray = json_decode($paymentToRecord, true);

            if (!isset($json['installmentID']) || !isset($json['recordedBy']) || !isset($json['locID'])) {
                return json_encode(['success' => false, 'message' => 'Missing required parameters']);
            }

            if (empty($paymentsArray)) {
                return json_encode(['success' => false, 'message' => 'No payments selected']);
            }

            // Start transaction
            $conn->beginTransaction();

            // Calculate total amount
            $totalAmount = 0;
            foreach ($paymentsArray as $payment) {
                $totalAmount += floatval($payment['amount']);
            }

            // Get current date and time


            // Insert invoice record for the payment
            $sql = "INSERT INTO `invoice`(`sales_from`, `amount`, `date`, `time`, `location_id`, `account_id`) 
                    VALUES ('Installment Payment', :amount, :date, :time, :locID, :accID)";

            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':amount', $totalAmount);
            $stmt->bindParam(':date', $date);
            $stmt->bindParam(':time', $time);
            $stmt->bindParam(':locID', $json['locID']);
            $stmt->bindParam(':accID', $json['recordedBy']);

            if (!$stmt->execute()) {
                throw new Exception('Failed to create payment invoice');
            }

            // Get the invoice ID
            $invoiceId = $conn->lastInsertId();

            // Update each payment status to PAID
            $sql = "UPDATE `installment_payment_sched` SET `status`='Paid' WHERE ips_id = :ipsID";
            $stmt = $conn->prepare($sql);

            foreach ($paymentsArray as $payment) {
                $stmt->bindParam(':ipsID', $payment['ips_id']);
                // $stmt->bindParam(':paidDate', $currentDate);
                // $stmt->bindParam(':invoiceId', $invoiceId);

                if (!$stmt->execute()) {
                    throw new Exception('Failed to update payment status for payment ID: ' . $payment['ips_id']);
                }
            }

            // Calculate remaining balance and update installment_sales
            $sql = "SELECT SUM(amount_due) as remaining_balance FROM installment_payment_sched 
                    WHERE installment_id = :installmentId AND status != 'Paid'";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':installmentId', $json['installmentID']);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $remainingBalance = $result['remaining_balance'] ?? 0;


            // Insert payment records
            $sql = "INSERT INTO `installment_payment_record`(`invoice_id`, `ips_id`, `date`, `time`)
                 VALUES (:invoiceId, :ipsID, :date, :time)";
            $stmt = $conn->prepare($sql);

            foreach ($paymentsArray as $payment) {
                $stmt->bindParam(':invoiceId', $invoiceId);
                $stmt->bindParam(':ipsID', $payment['ips_id']);
                $stmt->bindParam(':date', $date);
                $stmt->bindParam(':time', $time);

                if (!$stmt->execute()) {
                    throw new Exception('Failed to create payment record for payment ID: ' . $payment['ips_id']);
                }
            }


            // Calculate remaining balance
            $sql = "SELECT SUM(amount_due) as remaining_balance FROM installment_payment_sched 
                WHERE installment_id = :installmentId AND status != 'Paid'";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':installmentId', $json['installmentID']);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $remainingBalance = $result['remaining_balance'] ?? 0;


            // If remaining balance is zero or less, update installment status to Complete
            if ($remainingBalance <= 0) {
                $sql = "UPDATE `installment_sales` SET `status` = 'Complete' WHERE `installment_sales_id` = :installmentId";
                $stmt = $conn->prepare($sql);
                // $stmt->bindParam(':stats', 'Complete');
                $stmt->bindParam(':installmentId', $json['installmentID']);

                if (!$stmt->execute()) {
                    throw new Exception('Failed to update installment status');
                }
            }

            // Update installment_sales with new balance
            $sql = "UPDATE `installment_sales` SET `balance` = :balance WHERE `installment_sales_id` = :installmentId";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':balance', $remainingBalance);
            $stmt->bindParam(':installmentId', $json['installmentID']);

            if (!$stmt->execute()) {
                throw new Exception('Failed to update installment balance');
            }


            // Commit transaction
            $conn->commit();
            $returnValue = $invoiceId;



        } catch (Exception $e) {
            // Rollback transaction on error
            if ($conn->inTransaction()) {
                $conn->rollback();
            }

            $conn->rollBack();
            $returnValue = "Error: " . $e->getMessage();
            // $returnValue = "Errordsad: " . $e->getMessage();

        }

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);

    }

    function PaymentRecord($json)
    {
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'

        $json = json_decode($json, true);
        $sql = "SELECT `ipr_id`, `invoice_id`, `ips_id`, `date`, `time` 
                FROM `installment_payment_record`;";

        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }



}

// submitted by the client - operation and json data
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $operation = $_GET['operation'];
    $json = $_GET['json'];

    $paymentToRecord = $_GET['payments'] ?? '[]';

} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $operation = $_POST['operation'];
    $json = $_POST['json'];

    $paymentToRecord = $_POST['payments'] ?? '[]';

}

$user = new User();
switch ($operation) {
    case 'GetInstallment':
        echo $user->GetInstallment($json);
        break;
    case 'GetInstallmentD':
        echo $user->GetInstallmentD($json);
        break;
    case 'GetInstallmentD1':
        echo $user->GetInstallmentD1($json);
        break;
    case 'GetAllInstallmentD':
        echo $user->GetAllInstallmentD($json);
        break;
    case 'PayInstallment':
        echo $user->PayInstallment($json, $paymentToRecord);
        break;
    case 'PaymentRecords':
        echo $user->PaymentRecord($json);
        break;

}
?>