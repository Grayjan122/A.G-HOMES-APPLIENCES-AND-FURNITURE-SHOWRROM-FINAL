# Location Type Backend Setup

## 1. Update GetDropDown.php

Add this case to your `GetDropDown.php` file in `c:\xampp\htdocs\capstone-api\api\GetDropDown.php`:

```php
case 'GetLocationType':
    echo json_encode($user->GetLocationType($json));
    break;
```

Then add this method to your User class in the same file:

```php
function GetLocationType($json) {
    $sql = "SELECT loc_type_id, name FROM location_type ORDER BY name ASC";
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $data;
}
```

---

## 2. Update location.php

In `c:\xampp\htdocs\capstone-api\api\location.php`, update the **AddLocation** method to include `loc_type_id`:

### Find the AddLocation function and update the INSERT query:

**BEFORE:**
```php
function AddLocation($json) {
    $json = json_decode($json, true);
    $sql = "INSERT INTO location (location_name, contact_person, phone, email, address, branch_id) 
            VALUES (:locName, :contactPerson, :phone, :email, :address, :branchID)";
    $stmt = $this->pdo->prepare($sql);
    $stmt->bindParam(':locName', $json['locName']);
    $stmt->bindParam(':contactPerson', $json['contactPerson']);
    $stmt->bindParam(':phone', $json['phone']);
    $stmt->bindParam(':email', $json['email']);
    $stmt->bindParam(':address', $json['address']);
    $stmt->bindParam(':branchID', $json['branchID']);
    // ... rest of code
}
```

**AFTER:**
```php
function AddLocation($json) {
    $json = json_decode($json, true);
    $sql = "INSERT INTO location (location_name, contact_person, phone, email, address, branch_id, loc_type_id) 
            VALUES (:locName, :contactPerson, :phone, :email, :address, :branchID, :locTypeID)";
    $stmt = $this->pdo->prepare($sql);
    $stmt->bindParam(':locName', $json['locName']);
    $stmt->bindParam(':contactPerson', $json['contactPerson']);
    $stmt->bindParam(':phone', $json['phone']);
    $stmt->bindParam(':email', $json['email']);
    $stmt->bindParam(':address', $json['address']);
    $stmt->bindParam(':branchID', $json['branchID']);
    $stmt->bindParam(':locTypeID', $json['locTypeID']);
    // ... rest of code
}
```

---

### Update the UpdateLocationDetails function:

**BEFORE:**
```php
function UpdateLocationDetails($json) {
    $json = json_decode($json, true);
    $sql = "UPDATE location 
            SET location_name = :locName, 
                contact_person = :contactPerson, 
                phone = :phone, 
                email = :email, 
                address = :address, 
                branch_id = :branchID 
            WHERE location_id = :locID";
    $stmt = $this->pdo->prepare($sql);
    $stmt->bindParam(':locName', $json['locName']);
    $stmt->bindParam(':contactPerson', $json['contactPerson']);
    $stmt->bindParam(':phone', $json['phone']);
    $stmt->bindParam(':email', $json['email']);
    $stmt->bindParam(':address', $json['address']);
    $stmt->bindParam(':branchID', $json['branchID']);
    $stmt->bindParam(':locID', $json['locID']);
    // ... rest of code
}
```

**AFTER:**
```php
function UpdateLocationDetails($json) {
    $json = json_decode($json, true);
    $sql = "UPDATE location 
            SET location_name = :locName, 
                contact_person = :contactPerson, 
                phone = :phone, 
                email = :email, 
                address = :address, 
                branch_id = :branchID,
                loc_type_id = :locTypeID
            WHERE location_id = :locID";
    $stmt = $this->pdo->prepare($sql);
    $stmt->bindParam(':locName', $json['locName']);
    $stmt->bindParam(':contactPerson', $json['contactPerson']);
    $stmt->bindParam(':phone', $json['phone']);
    $stmt->bindParam(':email', $json['email']);
    $stmt->bindParam(':address', $json['address']);
    $stmt->bindParam(':branchID', $json['branchID']);
    $stmt->bindParam(':locTypeID', $json['locTypeID']);
    $stmt->bindParam(':locID', $json['locID']);
    // ... rest of code
}
```

---

### Update the GetLocationDetails function:

Update the SELECT query to include the location type information:

**BEFORE:**
```php
function GetLocationDetails($json) {
    $json = json_decode($json, true);
    $sql = "SELECT l.*, b.branch_name 
            FROM location l
            LEFT JOIN branch b ON l.branch_id = b.branch_id
            WHERE l.location_id = :locID";
    // ... rest of code
}
```

**AFTER:**
```php
function GetLocationDetails($json) {
    $json = json_decode($json, true);
    $sql = "SELECT l.*, 
                   b.branch_name, 
                   lt.name as name,
                   lt.loc_type_id
            FROM location l
            LEFT JOIN branch b ON l.branch_id = b.branch_id
            LEFT JOIN location_type lt ON l.loc_type_id = lt.loc_type_id
            WHERE l.location_id = :locID";
    // ... rest of code
}
```

**Note:** 
- The frontend automatically finds the location type ID based on the name
- But it's better to return `lt.loc_type_id` from backend for performance
- You can use any column alias: `name`, `loc_type_name`, `type_name`, or `location_type_name`

---

### Update the GetLocation function (optional, for displaying in list):

```php
function GetLocation($json) {
    $sql = "SELECT l.*, b.branch_name, lt.name as loc_type_name 
            FROM location l
            LEFT JOIN branch b ON l.branch_id = b.branch_id
            LEFT JOIN location_type lt ON l.loc_type_id = lt.loc_type_id
            ORDER BY l.location_id DESC";
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $data;
}
```

---

## 3. Database Check

Make sure your `location` table has the `loc_type_id` column. If not, run this SQL:

```sql
-- Check if column exists
SHOW COLUMNS FROM location LIKE 'loc_type_id';

-- If it doesn't exist, add it:
ALTER TABLE `location` 
ADD COLUMN `loc_type_id` INT(11) NULL AFTER `branch_id`,
ADD CONSTRAINT `fk_location_type` 
FOREIGN KEY (`loc_type_id`) REFERENCES `location_type`(`loc_type_id`)
ON DELETE SET NULL 
ON UPDATE CASCADE;
```

---

## Testing Steps

1. **Test GetLocationType**: Open your app and navigate to the Location page. Open browser console and check if location types are being fetched.

2. **Test Add Location**: Try adding a new location with all fields including location type.

3. **Test View Location**: Click on a location to view its details and verify the location type is displayed.

4. **Test Edit Location**: Edit a location and change its location type.

---

## Troubleshooting

### Location types not loading:
- Check browser console for errors
- Verify `GetLocationType` case is added to `GetDropDown.php`
- Check if `location_type` table has data: `SELECT * FROM location_type;`

### Error when adding location:
- Verify `loc_type_id` column exists in `location` table
- Check PHP error logs: `c:\xampp\apache\logs\error.log`
- Verify the column name matches exactly in PHP and database

### Location type not showing in view/edit:
- Verify the SELECT query includes the JOIN with `location_type` table
- Check if the location has a valid `loc_type_id` in the database

