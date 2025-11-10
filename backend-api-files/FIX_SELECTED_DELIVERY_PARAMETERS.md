# Fix for SaveSelectedDeliveryItems - Mixed Parameter Error

## Issue
The error "SQLSTATE[HY093]: Invalid parameter number: mixed named and positional parameters" occurs because the SQL query mixes named parameters (`:reqID`) with positional parameters (`?`).

## Location
In `requestStock.php`, in the `SaveSelectedDeliveryItems` function, around line 1590.

## Fix Required

Change this code:
```php
$getQuantitiesSql = "SELECT `product_id`, `qty` FROM `request_stock_details` 
    WHERE `request__stock_id` = :reqID AND `product_id` IN ($placeholders)";
$getQuantitiesStmt = $conn->prepare($getQuantitiesSql);
$getQuantitiesStmt->bindParam(':reqID', $reqID, PDO::PARAM_INT);
foreach ($selectedProducts as $idx => $prodId) {
    $getQuantitiesStmt->bindValue($idx + 1, $prodId, PDO::PARAM_INT);
}
```

To this:
```php
$getQuantitiesSql = "SELECT `product_id`, `qty` FROM `request_stock_details` 
    WHERE `request__stock_id` = ? AND `product_id` IN ($placeholders)";
$getQuantitiesStmt = $conn->prepare($getQuantitiesSql);
$getQuantitiesStmt->bindValue(1, $reqID, PDO::PARAM_INT);
foreach ($selectedProducts as $idx => $prodId) {
    $getQuantitiesStmt->bindValue($idx + 2, $prodId, PDO::PARAM_INT); // Start at 2 because reqID is at position 1
}
```

## Explanation
PDO doesn't allow mixing named parameters (`:reqID`) with positional parameters (`?`). We need to use all positional parameters (`?`) and bind them using `bindValue()` with numeric positions (1, 2, 3, etc.).

