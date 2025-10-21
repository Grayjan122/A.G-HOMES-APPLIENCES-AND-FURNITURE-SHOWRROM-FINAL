<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class User
{
    //get Sales by invoice
    function SalesByInvoice($json)
    {
        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'
        $json = json_decode($json, true);
        $sql = "SELECT a.`invoice_id`, a.`sales_from`, a.`amount`, a.`date`,
                a.`time`, a.`location_id`, a.`account_id`, b.location_name FROM `invoice` a
                INNER JOIN location b ON b.location_id = a.location_id ORDER BY a.invoice_id ASC";

        $stmt = $conn->prepare($sql);
        // $stmt->bindParam(':username', $json['username']);
        // $stmt->bindParam(':password', $json['password']);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    //sale walk in
    function walkSale($json, $salesDetails, $reportInventory, $updatedInventory)
    {
        include 'conn.php';
        $returnValue = "";

        try {
            // Start transaction
            $conn->beginTransaction();

            $salesDetails = json_decode($salesDetails, true);
            $updatedInventory = json_decode($updatedInventory, true);
            $report = json_decode($reportInventory, true);
            $json = json_decode($json, true);

            $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
            $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;



            // 1. Make invoice number
            $sql = "INSERT INTO `invoice`(`sales_from`, `amount`, `date`, `time`, `location_id`, `account_id`) 
                VALUES ('Walk-In Sales', :amount, :date, :time, :locID, :accID)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':amount', $json['total']);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
            $stmt->bindValue(':locID', $locationID, PDO::PARAM_INT);
            $stmt->bindValue(':accID', $accountID, PDO::PARAM_INT);
            $stmt->execute();
            $lastID = $conn->lastInsertId();

            // 2. Update the inventory
            foreach ($updatedInventory as $item) {
                $sql = "UPDATE `store_inventory` 
                    SET qty = :qty 
                    WHERE location_id = :storeID AND product_id = :productID";
                $stmt = $conn->prepare($sql);
                $stmt->bindValue(':qty', $item['newQty'], PDO::PARAM_INT);
                $stmt->bindValue(':storeID', $locationID, PDO::PARAM_INT);
                $stmt->bindValue(':productID', $item['prodID'], PDO::PARAM_INT);
                $stmt->execute();
            }

            // 3. Write the ledger
            foreach ($report as $item) {
                $sql = "INSERT INTO `store_inventory_transaction_ledger` (
                        `location_id`, `type`, `product_id`, `past_balance`, 
                        `qty`, `current_balance`, `date`, `time`, `account_id`
                    ) VALUES (
                        :storeID, 'Sales', :productID, :pastBal, 
                        :qty, :currentBal, :date, :time, :accID
                    )";
                $stmt = $conn->prepare($sql);
                $stmt->bindValue(':storeID', $locationID, PDO::PARAM_INT);
                $stmt->bindValue(':productID', $item['prodID'], PDO::PARAM_INT);
                $stmt->bindValue(':pastBal', $item['pastBalance'], PDO::PARAM_INT);
                $stmt->bindValue(':qty', $item['qty'], PDO::PARAM_INT);
                $stmt->bindValue(':currentBal', $item['currentBalance'], PDO::PARAM_INT);
                $stmt->bindValue(':date', $date);
                $stmt->bindValue(':time', $time);
                $stmt->bindValue(':accID', $accountID, PDO::PARAM_INT);
                $stmt->execute();
            }

            // 4. Sales header
            $totalQTY = 0;
            foreach ($salesDetails as $sales) {
                $totalQTY += $sales['quantity'];
            }

            $sql = "INSERT INTO `walk_in_sales`(
                    `invoice_id`, `total_amount`, `discount`, `discount_percentage`, 
                    `final_total_amount`, `total_qty_purchase`, `payment_method`, 
                    `payment_status`
                ) VALUES (
                    :lastID, :totalAmount, :discount, :discountValue, 
                    :finalAmount, :totalQTY, :paymentMethod, 'Paid'
                )";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':lastID', $lastID, PDO::PARAM_INT);
            $stmt->bindValue(':totalAmount', $json['subTotal']);
            $stmt->bindValue(':discount', $json['discount']);
            $stmt->bindValue(':discountValue', $json['discountValue']);
            $stmt->bindValue(':finalAmount', $json['total']);
            $stmt->bindValue(':totalQTY', $totalQTY, PDO::PARAM_INT);
            $stmt->bindValue(':paymentMethod', $json['payMethod']);
            // $stmt->bindValue(':date', $date);
            // $stmt->bindValue(':time', $time);
            $stmt->execute();
            $lastID1 = $conn->lastInsertId();

            // 5. Sales details
            foreach ($salesDetails as $sales) {
                $sql = "INSERT INTO `walk_in_sales_details`(
                        `wis_id`, `product_id`, `qty`, `price_per_qty`, `total_price`
                    ) VALUES (
                        :lastID, :prodID, :qty , :pricePQ, :total
                    )";
                $stmt = $conn->prepare($sql);
                $stmt->bindValue(':lastID', $lastID1, PDO::PARAM_INT);
                $stmt->bindValue(':prodID', $sales['product_id'], PDO::PARAM_INT);
                $stmt->bindValue(':pricePQ', $sales['price']);
                $stmt->bindValue(':qty', $sales['quantity'], PDO::PARAM_INT);
                $stmt->bindValue(':total', $sales['price'] * $sales['quantity']);
                $stmt->execute();
            }


            if (is_array($salesDetails)) {
                foreach ($salesDetails as $sales) {
                    $sql = "INSERT INTO `invoice_details` (
                            `invoice_id`, `product_id`, `qty`, `price_per_qty`, `total_price`
                        ) VALUES (
                            :invoiceId, :prodID, :qty, :pricePQ, :total
                        )";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':invoiceId', $lastID, PDO::PARAM_INT);
                    $stmt->bindValue(':prodID', (int) $sales['product_id'], PDO::PARAM_INT);
                    $stmt->bindValue(':pricePQ', $sales['price']);
                    $stmt->bindValue(':qty', (int) $sales['quantity'], PDO::PARAM_INT);
                    $stmt->bindValue(':total', $sales['price'] * $sales['quantity']);
                    $stmt->execute();
                }
            }

            // ✅ Commit transaction
            $conn->commit();
            $returnValue = $lastID;

        } catch (Exception $e) {
            // ❌ Rollback transaction on error
            $conn->rollBack();
            $returnValue = "Error: " . $e->getMessage();
        }

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function customerSale($json, $salesDetails, $reportInventory, $updatedInventory)
    {
        include 'conn.php';
        $returnValue = "";

        try {
            // Start transaction
            $conn->beginTransaction();

            $salesDetails = json_decode($salesDetails, true);
            $updatedInventory = json_decode($updatedInventory, true);
            $report = json_decode($reportInventory, true);
            $json = json_decode($json, true);

            $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
            $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
            $custID = isset($json['custID']) ? (int) $json['custID'] : 0;

            // ensure date/time are defined


            // 1. Make invoice number
            $sql = "INSERT INTO `invoice`(`sales_from`, `amount`, `date`, `time`, `location_id`, `account_id`) 
                VALUES ('Customer Sales', :amount, :date, :time, :locID, :accID)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':amount', $json['total']);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
            $stmt->bindValue(':locID', $locationID, PDO::PARAM_INT);
            $stmt->bindValue(':accID', $accountID, PDO::PARAM_INT);
            $stmt->execute();
            $invoiceId = $conn->lastInsertId();

            // 2. Update the inventory
            if (is_array($updatedInventory)) {
                foreach ($updatedInventory as $item) {
                    $sql = "UPDATE `store_inventory` 
                        SET qty = :qty 
                        WHERE location_id = :storeID AND product_id = :productID";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':qty', (int) $item['newQty'], PDO::PARAM_INT);
                    $stmt->bindValue(':storeID', $locationID, PDO::PARAM_INT);
                    $stmt->bindValue(':productID', (int) $item['prodID'], PDO::PARAM_INT);
                    $stmt->execute();
                }
            }

            // 3. Write the ledger
            if (is_array($report)) {
                foreach ($report as $item) {
                    $sql = "INSERT INTO `store_inventory_transaction_ledger` (
                            `location_id`, `type`, `product_id`, `past_balance`, 
                            `qty`, `current_balance`, `date`, `time`, `account_id`
                        ) VALUES (
                            :storeID, 'Sales', :productID, :pastBal, 
                            :qty, :currentBal, :date, :time, :accID
                        )";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':storeID', $locationID, PDO::PARAM_INT);
                    $stmt->bindValue(':productID', (int) $item['prodID'], PDO::PARAM_INT);
                    $stmt->bindValue(':pastBal', (int) $item['pastBalance'], PDO::PARAM_INT);
                    $stmt->bindValue(':qty', (int) $item['qty'], PDO::PARAM_INT);
                    $stmt->bindValue(':currentBal', (int) $item['currentBalance'], PDO::PARAM_INT);
                    $stmt->bindValue(':date', $date);
                    $stmt->bindValue(':time', $time);
                    $stmt->bindValue(':accID', $accountID, PDO::PARAM_INT);
                    $stmt->execute();
                }
            }

            // 4. Sales header
            $totalQTY = 0;
            if (is_array($salesDetails)) {
                foreach ($salesDetails as $sales) {
                    $totalQTY += (int) $sales['quantity'];
                }
            }

            $sql = "INSERT INTO `customer_sales` (
                    `invoice_id`, `total_amount`, `discount`, 
                    `final_total_amount`, `total_qty`, `payment_method`, `payment_status`, 
                    `discount_percentage`, `cust_id`
                ) VALUES (
                    :invoiceId, :totalAmount, :discount, 
                    :finalAmount, :totalQTY, :paymentMethod, :paymentStatus, :discountValue, :custID
                )";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':invoiceId', $invoiceId, PDO::PARAM_INT);
            $stmt->bindValue(':totalAmount', $json['subTotal']);
            $stmt->bindValue(':discount', $json['discount']);
            $stmt->bindValue(':finalAmount', $json['total']);
            $stmt->bindValue(':totalQTY', $totalQTY, PDO::PARAM_INT);
            $stmt->bindValue(':paymentMethod', $json['payMethod']);
            $stmt->bindValue(':paymentStatus', 'Paid'); // explicit placeholder
            $stmt->bindValue(':discountValue', $json['discountValue']);
            $stmt->bindValue(':custID', $custID, PDO::PARAM_INT);
            $stmt->execute();
            $customerSalesId = $conn->lastInsertId();

            // 5. Sales details
            if (is_array($salesDetails)) {
                foreach ($salesDetails as $sales) {
                    $sql = "INSERT INTO `customer_sales_details` (
                            `customer_sales_id`, `product_id`, `qty`, `price_per_qty`, `total_price`
                        ) VALUES (
                            :csId, :prodID, :qty, :pricePQ, :total
                        )";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':csId', $customerSalesId, PDO::PARAM_INT);
                    $stmt->bindValue(':prodID', (int) $sales['product_id'], PDO::PARAM_INT);
                    $stmt->bindValue(':pricePQ', $sales['price']);
                    $stmt->bindValue(':qty', (int) $sales['quantity'], PDO::PARAM_INT);
                    $stmt->bindValue(':total', $sales['price'] * $sales['quantity']);
                    $stmt->execute();
                }
            }

            if (is_array($salesDetails)) {
                foreach ($salesDetails as $sales) {
                    $sql = "INSERT INTO `invoice_details` (
                            `invoice_id`, `product_id`, `qty`, `price_per_qty`, `total_price`
                        ) VALUES (
                            :invoiceId, :prodID, :qty, :pricePQ, :total
                        )";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':invoiceId', $invoiceId, PDO::PARAM_INT);
                    $stmt->bindValue(':prodID', (int) $sales['product_id'], PDO::PARAM_INT);
                    $stmt->bindValue(':pricePQ', $sales['price']);
                    $stmt->bindValue(':qty', (int) $sales['quantity'], PDO::PARAM_INT);
                    $stmt->bindValue(':total', $sales['price'] * $sales['quantity']);
                    $stmt->execute();
                }
            }

            // ✅ Commit transaction
            $conn->commit();
            $returnValue = $invoiceId;

        } catch (Exception $e) {
            // ❌ Rollback transaction on error
            $conn->rollBack();
            $returnValue = "Error: " . $e->getMessage();
        }

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function installmentPlan($json, $salesDetails, $reportInventory, $updatedInventory, $sched)
    {
        include 'conn.php';
        $returnValue = "";

        try {
            // Start transaction
            $conn->beginTransaction();

            $dateDue = json_decode($sched, true);
            $salesDetails = json_decode($salesDetails, true);
            $updatedInventory = json_decode($updatedInventory, true);
            $report = json_decode($reportInventory, true);
            $json = json_decode($json, true);

            $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
            $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
            $custID = isset($json['custID']) ? (int) $json['custID'] : 0;




            // 1. Make invoice number
            $sql = "INSERT INTO `invoice`(`sales_from`, `amount`, `date`, `time`, `location_id`, `account_id`) 
                VALUES ('Installment Downpayment', :amount, :date, :time, :locID, :accID)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':amount', $json['downPayment']);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
            $stmt->bindValue(':locID', $locationID, PDO::PARAM_INT);
            $stmt->bindValue(':accID', $accountID, PDO::PARAM_INT);
            $stmt->execute();
            $lastID = $conn->lastInsertId();

            // 2. Update the inventory
            foreach ($updatedInventory as $item) {
                $sql = "UPDATE `store_inventory` 
                    SET qty = :qty 
                    WHERE location_id = :storeID AND product_id = :productID";
                $stmt = $conn->prepare($sql);
                $stmt->bindValue(':qty', $item['newQty'], PDO::PARAM_INT);
                $stmt->bindValue(':storeID', $locationID, PDO::PARAM_INT);
                $stmt->bindValue(':productID', $item['prodID'], PDO::PARAM_INT);
                $stmt->execute();
            }

            // 3. Write the ledger
            foreach ($report as $item) {
                $sql = "INSERT INTO `store_inventory_transaction_ledger` (
                        `location_id`, `type`, `product_id`, `past_balance`, 
                        `qty`, `current_balance`, `date`, `time`, `account_id`
                    ) VALUES (
                        :storeID, 'Sales', :productID, :pastBal, 
                        :qty, :currentBal, :date, :time, :accID
                    )";
                $stmt = $conn->prepare($sql);
                $stmt->bindValue(':storeID', $locationID, PDO::PARAM_INT);
                $stmt->bindValue(':productID', $item['prodID'], PDO::PARAM_INT);
                $stmt->bindValue(':pastBal', $item['pastBalance'], PDO::PARAM_INT);
                $stmt->bindValue(':qty', $item['qty'], PDO::PARAM_INT);
                $stmt->bindValue(':currentBal', $item['currentBalance'], PDO::PARAM_INT);
                $stmt->bindValue(':date', $date);
                $stmt->bindValue(':time', $time);
                $stmt->bindValue(':accID', $accountID, PDO::PARAM_INT);
                $stmt->execute();
            }

            // 4. Sales header
            $totalQTY = 0;
            foreach ($salesDetails as $sales) {
                $totalQTY += $sales['quantity'];
            }

            $sql = "INSERT INTO `installment_sales`(`invoice_id`, `dp_amount`, 
                        `dp_percentage`, `total_amount`, `interest_percentage`, `interest_amount`,
                        `remaining_bal`, `total_payment`, `payment_plan`, `total_sales_amount`, `balance`, 
                        `monthly_payment`, `cust_id`, `status`) 
                    VALUES (:invoiceID, :downPayment,
                        :dpPercentage, :origPrice , :interestPercentage , :interestAmount,
                        :remainingBalance , :totalPayment , :installmentPlan , :totalSales , :balance,
                        :monthlyPayement , :custID , 'ON GOING')";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':invoiceID', $lastID, PDO::PARAM_INT);

            $stmt->bindValue(':downPayment', $json['downPayment']);
            $stmt->bindValue(':dpPercentage', $json['downPercentage']);
            $stmt->bindValue(':origPrice', $json['origPrice']);
            $stmt->bindValue(':interestPercentage', $json['interestRate']);
            $stmt->bindValue(':interestAmount', $json['interestAmount']);
            $stmt->bindValue(':remainingBalance', $json['remainingBal']);
            $stmt->bindValue(':totalPayment', $json['totalPayment']);
            $stmt->bindValue(':installmentPlan', $json['installmentPlan']);
            $stmt->bindValue(':totalSales', $json['totalSales']);
            $stmt->bindValue(':balance', $json['balance']);
            $stmt->bindValue(':monthlyPayement', $json['monthlyPayment']);
            $stmt->bindValue(':custID', $custID, PDO::PARAM_INT);

            // $stmt->bindValue(':date', $date);
            // $stmt->bindValue(':time', $time);
            $stmt->execute();
            $lastID1 = $conn->lastInsertId();

            if (is_array($dateDue)) {
                foreach ($dateDue as $due) {
                    $sql = "INSERT INTO `installment_payment_sched`(`installment_id`, `due_date`, `payment_number`,`amount_due`, `status`) 
                            VALUES (:lastID, :dueDate , :paymentNumber , :amountDue , 'UNPAID')";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':lastID', $lastID1, PDO::PARAM_INT);
                    $dueDate = date('Y-m-d', strtotime($due['paymentDate']));
                    $stmt->bindValue(':dueDate', $dueDate, PDO::PARAM_STR);
                    $stmt->bindValue(':paymentNumber', $due['paymentNumber']);
                    $stmt->bindValue(':amountDue', $due['amountDue']);
                    $stmt->execute();
                }
            }

            // 5. Invoice details
            if (is_array($salesDetails)) {
                foreach ($salesDetails as $sales) {
                    $sql = "INSERT INTO `invoice_details` (
                            `invoice_id`, `product_id`, `qty`, `price_per_qty`, `total_price`
                        ) VALUES (
                            :invoiceId, :prodID, :qty, :pricePQ, :total
                        )";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':invoiceId', $lastID, PDO::PARAM_INT);
                    $stmt->bindValue(':prodID', (int) $sales['product_id'], PDO::PARAM_INT);
                    $stmt->bindValue(':pricePQ', $sales['price']);
                    $stmt->bindValue(':qty', (int) $sales['quantity'], PDO::PARAM_INT);
                    $stmt->bindValue(':total', $sales['price'] * $sales['quantity']);
                    $stmt->execute();
                }
            }

            // ✅ Commit transaction
            $conn->commit();
            $returnValue = $lastID;

        } catch (Exception $e) {
            // ❌ Rollback transaction on error
            $conn->rollBack();
            $returnValue = "Error: " . $e->getMessage();
        }

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }



    function CustomcustomerSale($json, $salesDetails, $reportInventory, $updatedInventory)
    {
        include 'conn.php';
        $returnValue = "";

        try {
            // Start transaction
            $conn->beginTransaction();

            $salesDetails = json_decode($salesDetails, true);
            $updatedInventory = json_decode($updatedInventory, true);
            $report = json_decode($reportInventory, true);
            $json = json_decode($json, true);

            $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
            $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
            $custID = isset($json['custID']) ? (int) $json['custID'] : 0;

            // ensure date/time are defined


            // 1. Make invoice number
            $sql = "INSERT INTO `invoice`(`sales_from`, `amount`, `date`, `time`, `location_id`, `account_id`) 
                VALUES ('Customize Sales', :amount, :date, :time, :locID, :accID)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':amount', $json['amountPaid']);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
            $stmt->bindValue(':locID', $locationID, PDO::PARAM_INT);
            $stmt->bindValue(':accID', $accountID, PDO::PARAM_INT);
            $stmt->execute();
            $invoiceId = $conn->lastInsertId();

            $totalQTY = 0;

            $count1 = 0;
            $count2 = 0;
            foreach ($salesDetails as $sales) {
                $totalQTY += $sales['quantity'];

                if ($sales['customizationType'] === 'semi') {
                    $count1++;
                } elseif ($sales['customizationType'] === 'full') {
                    $count2++;
                }
            }
            if ($count1 > 0 && $count2 > 0) {
                $customizeType = 'Semi-Customized and Full-Customized';
                // throw new Exception("Cannot mix Semi-Custom and Full-Custom items in one sale.");
            } elseif ($count1 > 0) {
                $customizeType = 'Semi-Customized';
            } elseif ($count2 > 0) {
                $customizeType = 'Full-Customized';
            } else {
                throw new Exception("No valid customize type found in sales details.");
            }

            $balance = $json['subTotal'] - $json['amountPaid'];
            $status = $balance <= 0 ? 'Paid' : 'Partial';


            //customize sales
            $sql = "INSERT INTO `customize_sales`( `invoice_id`, `total_qty`, `total_price`, 
                     `down_payment`, `balance`, `status`, `customize_type`, `cust_id`) 
                VALUES (:invoiceId, :totalQty, :totalPrice, 
                    :downPayment, :balance, :status, :customizeType, :custId)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':invoiceId', $invoiceId, PDO::PARAM_INT);
            $stmt->bindValue(':totalQty', $totalQTY, PDO::PARAM_INT);
            $stmt->bindValue(':totalPrice', $json['subTotal']);
            $stmt->bindValue(':downPayment', $json['amountPaid']);
            $stmt->bindValue(':balance', $balance);
            $stmt->bindValue(':status', $status);
            $stmt->bindValue(':customizeType', $customizeType);
            $stmt->bindValue(':custId', $custID, PDO::PARAM_INT);
            $stmt->execute();
            $customize_sales_id = $conn->lastInsertId();

            //customize sales details
            foreach ($salesDetails as $sales) {

                if ($sales['customizationType'] == 'semi') {
                    $sql = "INSERT INTO `semi_customize_details`(`customize_sales_id`, `baseProduct_id`, `modifications`, 
                             `orig_price`, `adjusted_price`, `qty`, `total`) 
                            VALUES (:customerSalesId, :baseProductId, :modifications,
                               :origPrice, :adjustedPrice, :qty, :total)";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':customerSalesId', $customize_sales_id, PDO::PARAM_INT);
                    $stmt->bindValue(':baseProductId', $sales['baseProduct']['product_id'], PDO::PARAM_INT);
                    $stmt->bindValue(':modifications', $sales['modifications']);
                    $stmt->bindValue(':origPrice', $sales['baseProduct']['price']);
                    $stmt->bindValue(':adjustedPrice', $sales['price']);
                    $stmt->bindValue(':qty', $sales['quantity'], PDO::PARAM_INT);
                    $stmt->bindValue(':total', $sales['price'] * $sales['quantity']);
                    $stmt->execute();
                } elseif ($sales['customizationType'] == 'full') {
                    $sql = "INSERT INTO `full_customize_details`(`customize_sales_id`,`additional_description`, `description`, `price`, `qty`, `total_price`) 
                            VALUES (:customerSalesId, :additionalDescription, :description, :price, :qty, :totalPrice)";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':customerSalesId', $customize_sales_id, PDO::PARAM_INT);
                    $stmt->bindValue(':additionalDescription', $sales['modifications']);
                    $stmt->bindValue(':description', $sales['description']);
                    $stmt->bindValue(':price', $sales['price']);
                    $stmt->bindValue(':qty', $sales['quantity'], PDO::PARAM_INT);
                    $stmt->bindValue(':totalPrice', $sales['price'] * $sales['quantity']);
                    $stmt->execute();

                }



            }

            //make request
            $status = 'Pending';
            $sql = "INSERT INTO `customize_request`(`customize_sales_id`, `status`, `date`, `time`, `req_from`, `req_to`) 
                VALUES (:customerSalesId, :status, :date, :time, :reqFrom, :reqTo)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':customerSalesId', $customize_sales_id, PDO::PARAM_INT);
            $stmt->bindValue(':status', $status);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
            $stmt->bindValue(':reqFrom',$json['locID']);
            $stmt->bindValue(':reqTo', $json['warehouseID']);
            $stmt->execute();
            $customizereqID = $conn->lastInsertId();

            //insert a reports tracking
            $sql = "INSERT INTO `customize_request_report`( `customize_request_id`, `status`, `date`, `time`) 
                     VALUES (:customerSalesId, :status, :date, :time)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':customerSalesId', $customizereqID, PDO::PARAM_INT);
            $stmt->bindValue(':status', $status);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
            $stmt->execute();




            // ✅ Commit transaction
            $conn->commit();
            $returnValue = $invoiceId;

        } catch (Exception $e) {
            // ❌ Rollback transaction on error
            $conn->rollBack();
            $returnValue = "Error: " . $e->getMessage();
        }

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function CustomizeInstallmentSales($json, $salesDetails, $reportInventory, $updatedInventory, $sched)
    {
        include 'conn.php';
        $returnValue = "";

        try {
            // Start transaction
            $conn->beginTransaction();

            $dateDue = json_decode($sched, true);
            $salesDetails = json_decode($salesDetails, true);
            $updatedInventory = json_decode($updatedInventory, true);
            $report = json_decode($reportInventory, true);
            $json = json_decode($json, true);

            $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
            $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
            $custID = isset($json['custID']) ? (int) $json['custID'] : 0;




            // 1. Make invoice number
            $sql = "INSERT INTO `invoice`(`sales_from`, `amount`, `date`, `time`, `location_id`, `account_id`) 
                VALUES ('Customize Installment Downpayment', :amount, :date, :time, :locID, :accID)";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':amount', $json['downPayment']);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
            $stmt->bindValue(':locID', $locationID, PDO::PARAM_INT);
            $stmt->bindValue(':accID', $accountID, PDO::PARAM_INT);
            $stmt->execute();
            $lastID = $conn->lastInsertId();



            // 4. Sales header
            $totalQTY = 0;
            foreach ($salesDetails as $sales) {
                $totalQTY += $sales['quantity'];
            }



            $sql = "INSERT INTO `installment_sales`(`invoice_id`, `dp_amount`, 
                        `dp_percentage`, `total_amount`, `interest_percentage`, `interest_amount`,
                        `remaining_bal`, `total_payment`, `payment_plan`, `total_sales_amount`, `balance`, 
                        `monthly_payment`, `cust_id`, `status`) 
                    VALUES (:invoiceID, :downPayment,
                        :dpPercentage, :origPrice , :interestPercentage , :interestAmount,
                        :remainingBalance , :totalPayment , :installmentPlan , :totalSales , :balance,
                        :monthlyPayement , :custID , 'ON GOING')";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':invoiceID', $lastID, PDO::PARAM_INT);

            $stmt->bindValue(':downPayment', $json['downPayment']);
            $stmt->bindValue(':dpPercentage', $json['downPercentage']);
            $stmt->bindValue(':origPrice', $json['origPrice']);
            $stmt->bindValue(':interestPercentage', $json['interestRate']);
            $stmt->bindValue(':interestAmount', $json['interestAmount']);
            $stmt->bindValue(':remainingBalance', $json['remainingBal']);
            $stmt->bindValue(':totalPayment', $json['totalPayment']);
            $stmt->bindValue(':installmentPlan', $json['installmentPlan']);
            $stmt->bindValue(':totalSales', $json['totalSales']);
            $stmt->bindValue(':balance', $json['balance']);
            $stmt->bindValue(':monthlyPayement', $json['monthlyPayment']);
            $stmt->bindValue(':custID', $custID, PDO::PARAM_INT);

            // $stmt->bindValue(':date', $date);
            // $stmt->bindValue(':time', $time);
            $stmt->execute();
            $lastID1 = $conn->lastInsertId();

            if (is_array($dateDue)) {
                foreach ($dateDue as $due) {
                    $sql = "INSERT INTO `installment_payment_sched`(`installment_id`, `due_date`, `payment_number`,`amount_due`, `status`) 
                            VALUES (:lastID, :dueDate , :paymentNumber , :amountDue , 'UNPAID')";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindValue(':lastID', $lastID1, PDO::PARAM_INT);
                    $dueDate = date('Y-m-d', strtotime($due['paymentDate']));
                    $stmt->bindValue(':dueDate', $dueDate, PDO::PARAM_STR);
                    $stmt->bindValue(':paymentNumber', $due['paymentNumber']);
                    $stmt->bindValue(':amountDue', $due['amountDue']);
                    $stmt->execute();
                }
            }

            // 5. Invoice details


            // ✅ Commit transaction
            $conn->commit();
            $returnValue = $lastID;

        } catch (Exception $e) {
            // ❌ Rollback transaction on error
            $conn->rollBack();
            $returnValue = "Error: " . $e->getMessage();
        }

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }



}

// submitted by the client - operation and json data
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $operation = $_GET['operation'];
    $json = $_GET['json'];

    $salesDetails = $_GET['salesDetails'] ?? '[]';
    $reportInventory = $_GET['reportInventory'] ?? '[]';
    $updatedInventory = $_GET['updateIn'] ?? '[]';
    $sched = $_GET['dateDue'] ?? '[]';



} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $operation = $_POST['operation'];
    $json = $_POST['json'];

    $salesDetails = $_POST['salesDetails'] ?? '[]';
    $reportInventory = $_POST['reportInventory'] ?? '[]';
    $updatedInventory = $_POST['updateIn'] ?? '[]';
    $sched = $_POST['dateDue'] ?? '[]';



}

$user = new User();
switch ($operation) {
    case 'SalesByInvoice':
        echo $user->SalesByInvoice($json);
        break;
    case 'walkSale':
        echo $user->walkSale($json, $salesDetails, $reportInventory, $updatedInventory);
        break;
    case 'customerSale':
        echo $user->customerSale($json, $salesDetails, $reportInventory, $updatedInventory);
        break;
    case 'installmentPlan':
        echo $user->installmentPlan($json, $salesDetails, $reportInventory, $updatedInventory, $sched);
        break;
    case 'CustomeSalesFull':
        echo $user->CustomcustomerSale($json, $salesDetails, $reportInventory, $updatedInventory);
        break;
    case 'CustomizeinstallmentPlan':
        echo $user->CustomizeInstallmentSales($json, $salesDetails, $reportInventory, $updatedInventory, $sched);
        break;

}
?>