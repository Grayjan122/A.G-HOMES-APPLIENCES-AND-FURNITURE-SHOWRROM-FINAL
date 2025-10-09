-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 02, 2025 at 05:27 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `agdatabase`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE `account` (
  `account_id` int(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `user_password` varchar(100) NOT NULL,
  `fname` varchar(255) NOT NULL,
  `mname` varchar(255) NOT NULL,
  `lname` varchar(255) NOT NULL,
  `role_id` int(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `address` varchar(50) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL,
  `active_status` text NOT NULL,
  `date_created` date NOT NULL,
  `birth_date` date NOT NULL,
  `location_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`account_id`, `username`, `user_password`, `fname`, `mname`, `lname`, `role_id`, `email`, `address`, `phone`, `status`, `active_status`, `date_created`, `birth_date`, `location_id`) VALUES
(7, 'admin2025', 'admin2025', 'Jan Nichols', 'Nguyen', 'Maristela', 1, 'jang.maristela.coc@phinmaed.com', 'Zone 3 canitoan', '09972654952', 'Offline', 'Online', '2025-07-25', '2003-01-22', 12),
(8, 'inventory2025', 'inventory2025', 'Gray', 'Nguyen', 'Fullbuster', 3, 'janmaristela2003@gmail.com', 'Zone 3 canitoan', '09476976978', 'Offline', 'Offline', '2025-07-25', '0000-00-00', 12),
(9, 'lyca2025', 'lyca2025', 'Lyca', 'Bahandi', 'Cantilado', 5, 'lyca@gmail.com', 'Carmen Ylaya', '1', 'Offline', 'Online', '2025-07-28', '2002-10-03', 13),
(10, 'kyu', 'kyuchansue', 'Christian', 'Colipano', 'Butaya', 3, 'christianbutaya23@gmail.com', 'Zone 5, Cagayan de Oro City', '09353216482', 'Offline', 'Offline', '2025-08-01', '2025-11-23', 12),
(11, 'carl', 'carl123', 'Carl', 'Ranisses', 'Hibaya', 3, 'hibayacj8@gmail.com', 'zone-9 caffas, macanhan cagayand de oro city', '09635819495', 'Active', 'Offline', '2025-08-01', '2003-01-21', 13),
(12, 'reyzyl', 'balaba', 'Reyzyl', 'Alcantara', 'Balaba', 2, 'balaba@gmail.com', 'Mambuaya, cdoc', '0935432737', 'Offline', 'Offline', '2025-08-01', '2025-01-01', 12),
(14, 'cristopher2025', 'cristopher2025', 'Cristopher', 'S', 'Johansson', 5, 'johansson@gmail.com', 'Carmen', '12', 'Offline', 'Offline', '2025-08-04', '2025-08-04', 13),
(15, 'claire2025', 'claire2025', 'Claire Ivy', ' Hemosilla', 'Arcay', 4, 'claire@gmail.com', 'Canitoan', '1', 'Offline', 'Offline', '2025-08-05', '2003-05-03', 12),
(16, 'saletester1', 'saletester1', 'Sales Clerk', 'T', 'Tester 1', 2, 'tester1@gmail.com', 'tester1', '1', 'Offline', 'Offline', '2025-08-26', '2025-08-26', 14),
(17, 'inventoryjasaan', 'inventoryjasaan', 'Christian', 'Colipano', 'Butaya', 3, 'christianbutaya@gmail.com', 'zone 5, bonbon cdoc', '09353216482', 'Offline', 'Online', '2025-09-02', '2003-02-11', 14);

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `activity_log_id` int(50) NOT NULL,
  `activity` varchar(100) NOT NULL,
  `time` varchar(10) NOT NULL,
  `date` date NOT NULL,
  `account_id` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`activity_log_id`, `activity`, `time`, `date`, `account_id`) VALUES
(1, 'Log In', '23', '0000-00-00', 9),
(2, 'Log In', '23:05:04', '0000-00-00', 7),
(3, 'Log Out', '23:10:18', '0000-00-00', 7),
(4, 'Log In', '23:10:38', '0000-00-00', 9),
(5, 'Log Out', '23:10:47', '0000-00-00', 9),
(6, 'Log In', '23:43:37', '0000-00-00', 8),
(7, 'Log In', '00:10:44', '0000-00-00', 9),
(8, 'Log In', '22:58:00', '0000-00-00', 8),
(9, 'Log In', '22:58:28', '0000-00-00', 9),
(10, 'Log Out', '23:55:00', '0000-00-00', 8),
(11, 'Log In', '08:39:40', '0000-00-00', 7),
(12, 'Log In', '19:21:34', '0000-00-00', 9),
(13, 'Log In', '19:22:45', '0000-00-00', 9),
(14, 'Log In', '23:22:34', '0000-00-00', 8),
(15, 'Log In', '00:23:09', '0000-00-00', 14),
(16, 'Log In', '02:00:45', '0000-00-00', 7),
(17, 'Log In', '02:03:30', '0000-00-00', 15),
(18, 'Log In', '03:19:16', '0000-00-00', 8),
(19, 'Log In', '07:25:57', '0000-00-00', 8),
(20, 'Log In', '10:10:31', '0000-00-00', 14),
(21, 'Log In', '10:12:37', '0000-00-00', 14),
(22, 'Log In', '20:36:21', '2025-08-07', 9),
(23, 'Log In', '22:16:27', '2025-08-07', 8),
(24, 'Log In', '11:13:28', '2025-08-11', 14),
(25, 'Log In', '11:13:29', '2025-08-11', 14),
(26, 'Log In', '11:13:46', '2025-08-11', 14),
(27, 'Log Out', '11:14:25', '2025-08-11', 14),
(28, 'Log In', '11:14:38', '2025-08-11', 7),
(29, 'Log In', '11:15:06', '2025-08-11', 7),
(30, 'Log In', '11:15:07', '2025-08-11', 10),
(31, 'Log In', '11:15:55', '2025-08-11', 14),
(32, 'Log In', '11:17:26', '2025-08-11', 9),
(33, 'Log In', '11:18:01', '2025-08-11', 8),
(34, 'Log Out', '11:28:22', '2025-08-11', 14),
(35, 'Log In', '11:29:14', '2025-08-11', 14),
(36, 'Log In', '11:30:20', '2025-08-11', 14),
(37, 'Log Out', '11:30:25', '2025-08-11', 14),
(38, 'Log In', '11:31:15', '2025-08-11', 14),
(39, 'Log In', '11:31:43', '2025-08-11', 9),
(40, 'Log Out', '11:31:57', '2025-08-11', 14),
(41, 'Log In', '11:34:25', '2025-08-11', 14),
(42, 'Log In', '14:45:26', '2025-08-11', 14),
(43, 'Log In', '14:45:27', '2025-08-11', 10),
(44, 'Log In', '21:13:51', '2025-08-12', 9),
(45, 'Log In', '21:13:53', '2025-08-12', 9),
(46, 'Log In', '21:14:04', '2025-08-12', 8),
(47, 'Log In', '22:33:57', '2025-08-12', 8),
(48, 'Log In', '06:02:31', '2025-08-13', 9),
(49, 'Log In', '06:02:47', '2025-08-13', 8),
(50, 'Request Stock Out List', '06:17:12', '2025-08-13', 8),
(51, 'Sent a request from Agora Showroom Main to Warehouse CDO', '06:35:13', '2025-08-13', 8),
(52, 'Get the inventory reports of Agora Showroom Main', '06:42:39', '2025-08-13', 8),
(53, 'Track the request #60', '06:49', '2025-08-13', 8),
(54, 'Accept the request #61', '07:01', '2025-08-13', 9),
(55, 'Deliver the request #61', '07:06', '2025-08-13', 9),
(56, 'Track the request #62', '07:10', '2025-08-13', 8),
(57, 'Track the request #61', '07:10', '2025-08-13', 8),
(58, 'Receive the delivery from request #61', '07:11', '2025-08-13', 8),
(59, 'Mark the request #61 to complete', '07:14', '2025-08-13', 9),
(60, 'Log In', '07:41', '2025-08-13', 9),
(61, 'Log In', '07:44', '2025-08-13', 9),
(62, 'Log Out', '07:44', '2025-08-13', 9),
(63, 'Log In', '07:44', '2025-08-13', 9),
(64, 'Log Out', '07:44', '2025-08-13', 9),
(65, 'Log In', '07:46', '2025-08-13', 7),
(67, 'Log In', '07:51', '2025-08-13', 7),
(68, 'Log In', '07:51', '2025-08-13', 7),
(69, 'Log In', '07:54', '2025-08-13', 9),
(70, 'Log Out', '07:55', '2025-08-13', 9),
(71, 'Log In', '07:55', '2025-08-13', 8),
(72, 'Request Stock Out List', '07:55', '2025-08-13', 8),
(73, 'Get the inventory reports of Agora Showroom Main', '09:09', '2025-08-13', 8),
(74, 'Log In', '10:15', '2025-08-13', 14),
(75, 'Log In', '10:15', '2025-08-13', 14),
(76, 'Log In', '10:15', '2025-08-13', 14),
(77, 'Log In', '10:15', '2025-08-13', 14),
(78, 'Log In', '10:15', '2025-08-13', 14),
(79, 'Log In', '10:15', '2025-08-13', 10),
(80, 'Request Stock Out List', '10:15', '2025-08-13', 8),
(81, 'Log In', '10:16', '2025-08-13', 14),
(82, 'Request Stock Out List', '10:17', '2025-08-13', 10),
(83, 'Sent a request from Agora Showroom Main to Warehouse CDO', '10:17', '2025-08-13', 10),
(84, 'Accept the request #64', '10:18', '2025-08-13', 14),
(85, 'Deliver the request #64', '10:18', '2025-08-13', 14),
(86, 'Track the request #64', '10:18', '2025-08-13', 10),
(87, 'Track the request #64', '10:19', '2025-08-13', 10),
(88, 'Receive the delivery from request #64', '10:19', '2025-08-13', 10),
(89, 'Get the inventory reports of Agora Showroom Main', '10:19', '2025-08-13', 10),
(90, 'Track the request #64', '10:20', '2025-08-13', 10),
(91, 'Mark the request #64 to complete', '10:20', '2025-08-13', 14),
(92, 'Track the request #64', '10:21', '2025-08-13', 10),
(93, 'Sent a request from Agora Showroom Main to Warehouse CDO', '10:25', '2025-08-13', 8),
(94, 'Accept the request #65', '10:25', '2025-08-13', 14),
(95, 'Deliver the request #65', '10:25', '2025-08-13', 14),
(96, 'Receive the delivery from request #65', '10:27', '2025-08-13', 8),
(97, 'Get the inventory reports of Agora Showroom Main', '10:27', '2025-08-13', 10),
(98, 'Request Stock Out List', '10:29', '2025-08-13', 10),
(99, 'Log In', '10:31', '2025-08-13', 7),
(100, 'Log In', '10:31', '2025-08-13', 7),
(101, 'Request Stock Out List', '10:34', '2025-08-13', 8),
(102, 'Sent a request from Agora Showroom Main to Warehouse CDO', '10:35', '2025-08-13', 10),
(103, 'Accept the request #66', '10:35', '2025-08-13', 14),
(104, 'Deliver the request #66', '10:35', '2025-08-13', 14),
(105, 'Track the request #66', '10:35', '2025-08-13', 10),
(106, 'Receive the delivery from request #66', '10:35', '2025-08-13', 10),
(107, 'Mark the request #66 to complete', '10:35', '2025-08-13', 14),
(108, 'Sent a request from Agora Showroom Main to Warehouse CDO', '10:38', '2025-08-13', 10),
(109, 'Accept the request #67', '10:38', '2025-08-13', 14),
(110, 'Deliver the request #67', '10:38', '2025-08-13', 14),
(111, 'Request Stock Out List', '10:38', '2025-08-13', 8),
(112, 'Track the request #67', '10:38', '2025-08-13', 10),
(113, 'Request Stock Out List', '10:40', '2025-08-13', 8),
(114, 'Request Stock Out List', '10:42', '2025-08-13', 8),
(115, 'Request Stock Out List', '10:44', '2025-08-13', 8),
(116, 'Receive the delivery from request #67', '10:45', '2025-08-13', 10),
(117, 'Get the inventory reports of Agora Showroom Main', '10:45', '2025-08-13', 8),
(118, 'Mark the request #67 to complete', '10:45', '2025-08-13', 14),
(119, 'Sent a request from Agora Showroom Main to Warehouse CDO', '10:46', '2025-08-13', 10),
(120, 'Accept the request #68', '10:47', '2025-08-13', 14),
(121, 'Deliver the request #68', '10:47', '2025-08-13', 14),
(122, 'Track the request #68', '10:47', '2025-08-13', 10),
(123, 'Receive the delivery from request #68', '10:47', '2025-08-13', 10),
(124, 'Get the inventory reports of Warehouse CDO', '10:47', '2025-08-13', 8),
(125, 'Get the inventory reports of Agora Showroom Main', '10:47', '2025-08-13', 8),
(126, 'Mark the request #68 to complete', '10:47', '2025-08-13', 14),
(127, 'Sent a request from Agora Showroom Main to Warehouse CDO', '10:48', '2025-08-13', 10),
(128, 'Accept the request #69', '10:48', '2025-08-13', 14),
(129, 'Deliver the request #69', '10:48', '2025-08-13', 14),
(130, 'Receive the delivery from request #69', '10:58', '2025-08-13', 10),
(131, 'Get the inventory reports of Agora Showroom Main', '10:58', '2025-08-13', 8),
(132, 'Get the inventory reports of Warehouse CDO', '10:59', '2025-08-13', 8),
(133, 'Get the inventory reports of Agora Showroom Main', '10:59', '2025-08-13', 8),
(134, 'Get the inventory reports of Agora Showroom Main', '10:59', '2025-08-13', 8),
(135, 'Sent a request from Agora Showroom Main to Warehouse CDO', '11:00', '2025-08-13', 10),
(136, 'Accept the request #70', '11:00', '2025-08-13', 14),
(137, 'Deliver the request #70', '11:00', '2025-08-13', 14),
(138, 'Receive the delivery from request #70', '11:00', '2025-08-13', 8),
(139, 'Get the inventory reports of Agora Showroom Main', '11:00', '2025-08-13', 8),
(140, 'Request Stock Out List', '11:10', '2025-08-13', 8),
(141, 'Sent a request from Agora Showroom Main to Warehouse CDO', '11:10', '2025-08-13', 10),
(142, 'Accept the request #71', '11:11', '2025-08-13', 14),
(143, 'Deliver the request #71', '11:11', '2025-08-13', 14),
(144, 'Track the request #71', '11:14', '2025-08-13', 8),
(145, 'Sent a request from Agora Showroom Main to Warehouse CDO', '11:20', '2025-08-13', 10),
(146, 'Accept the request #62', '11:28', '2025-08-13', 9),
(147, 'Accept the request #72', '11:29', '2025-08-13', 14),
(148, 'Deliver the request #72', '11:40', '2025-08-13', 14),
(149, 'Accept the request #63', '11:51', '2025-08-13', 14),
(150, 'Receive the delivery from request #72', '11:52', '2025-08-13', 10),
(151, 'Track the request #65', '11:54', '2025-08-13', 8),
(152, 'Track the request #65', '11:55', '2025-08-13', 8),
(153, 'Track the request #64', '11:55', '2025-08-13', 8),
(154, 'Track the request #62', '11:55', '2025-08-13', 8),
(155, 'Get the inventory reports of Agora Showroom Main', '11:55', '2025-08-13', 10),
(156, 'Get the inventory reports of Agora Showroom Main', '11:56', '2025-08-13', 10),
(157, 'Sent a request from Agora Showroom Main to Warehouse CDO', '11:59', '2025-08-13', 10),
(158, 'Accept the request #73', '12:00', '2025-08-13', 14),
(159, 'Deliver the request #73', '12:00', '2025-08-13', 14),
(160, 'Receive the delivery from request #71', '12:02', '2025-08-13', 10),
(161, 'Get the inventory reports of Agora Showroom Main', '12:02', '2025-08-13', 10),
(162, 'Receive the delivery from request #73', '12:02', '2025-08-13', 10),
(163, 'Get the inventory reports of Agora Showroom Main', '12:03', '2025-08-13', 10),
(164, 'Get the inventory reports of Agora Showroom Main', '12:04', '2025-08-13', 10),
(165, 'Get the inventory reports of Agora Showroom Main', '12:04', '2025-08-13', 8),
(166, 'Get the inventory reports of Warehouse CDO', '12:04', '2025-08-13', 8),
(167, 'Sent a request from Agora Showroom Main to Warehouse CDO', '12:05', '2025-08-13', 10),
(168, 'Track the request #74', '23:14', '2025-08-13', 8),
(169, 'Get the inventory reports of Agora Showroom Main', '23:14', '2025-08-13', 8),
(170, 'Get the inventory reports of Warehouse CDO', '23:14', '2025-08-13', 8),
(171, 'Get the inventory reports of Agora Showroom Main', '23:14', '2025-08-13', 8),
(172, 'Get the inventory reports of Warehouse CDO', '23:14', '2025-08-13', 8),
(173, 'Get the inventory reports of Agora Showroom Main', '23:14', '2025-08-13', 8),
(174, 'Log Out', '23:27', '2025-08-13', 8),
(175, 'Log Out', '23:27', '2025-08-13', 7),
(176, 'Log In', '23:27', '2025-08-13', 8),
(177, 'Log In', '23:28', '2025-08-13', 8),
(178, 'Get the inventory reports of Agora Showroom Main', '23:29', '2025-08-13', 8),
(179, 'Get the inventory reports of Warehouse CDO', '23:29', '2025-08-13', 8),
(180, 'Track the request #67', '23:30', '2025-08-13', 8),
(181, 'Request Stock Out List', '23:30', '2025-08-13', 8),
(182, 'Sent a request from Agora Showroom Main to Warehouse CDO', '23:30', '2025-08-13', 8),
(183, 'Log In', '23:30', '2025-08-13', 9),
(184, 'Accept the request #75', '23:31', '2025-08-13', 9),
(185, 'Deliver the request #75', '23:31', '2025-08-13', 9),
(186, 'Get the inventory reports of Agora Showroom Main', '23:32', '2025-08-13', 8),
(187, 'Mark the request #75 to complete', '23:33', '2025-08-13', 9),
(188, 'Deliver the request #63', '23:35', '2025-08-13', 9),
(189, 'Deliver the request #62', '23:50', '2025-08-13', 9),
(190, 'Get the inventory reports of Agora Showroom Main', '23:51', '2025-08-13', 8),
(191, 'Receive the delivery from request #62', '23:51', '2025-08-13', 8),
(192, 'Get the inventory reports of Agora Showroom Main', '23:51', '2025-08-13', 8),
(193, 'Track the request #75', '00:05', '2025-08-14', 8),
(194, 'Track the request #73', '00:06', '2025-08-14', 8),
(195, 'Log In', '04:51', '2025-08-14', 9),
(196, 'Log In', '04:57', '2025-08-14', 8),
(197, 'Log In', '05:02', '2025-08-14', 7),
(198, 'Log In', '05:35', '2025-08-14', 9),
(199, 'Log In', '05:35', '2025-08-14', 8),
(200, 'Log In', '05:36', '2025-08-14', 7),
(201, 'Stock In A Product', '06:29', '2025-08-14', 9),
(202, 'Request Stock Out List', '06:31', '2025-08-14', 8),
(203, 'Request Stock Out List', '06:31', '2025-08-14', 8),
(204, 'Request Stock Out List', '06:50', '2025-08-14', 8),
(205, 'Get the inventory reports of Warehouse CDO', '08:59', '2025-08-14', 8),
(206, 'Get the inventory reports of Agora Showroom Main', '08:59', '2025-08-14', 8),
(207, 'Get the inventory reports of Warehouse CDO', '08:59', '2025-08-14', 8),
(208, 'Get the inventory reports of Agora Showroom Main', '09:00', '2025-08-14', 9),
(209, 'Get the inventory reports of Warehouse CDO', '09:00', '2025-08-14', 9),
(210, 'Request Stock Out List', '09:04', '2025-08-14', 8),
(211, 'Request Stock Out List', '09:04', '2025-08-14', 8),
(212, 'Request Stock Out List', '09:04', '2025-08-14', 8),
(213, 'Request Stock Out List', '09:05', '2025-08-14', 8),
(214, 'Sent a request from Agora Showroom Main to Warehouse CDO', '09:05', '2025-08-14', 8),
(215, 'Accept the request #77', '09:07', '2025-08-14', 9),
(216, 'Request Stock Out List', '09:08', '2025-08-14', 8),
(217, 'Sent a request from Agora Showroom Main to Warehouse CDO', '09:08', '2025-08-14', 8),
(218, 'Accept the request #78', '09:08', '2025-08-14', 9),
(219, 'Deliver the request #78', '09:09', '2025-08-14', 9),
(220, 'Deliver the request #77', '09:11', '2025-08-14', 9),
(221, 'Get the inventory reports of Agora Showroom Main', '09:15', '2025-08-14', 8),
(222, 'Track the request #78', '09:16', '2025-08-14', 8),
(223, 'Track the request #73', '09:17', '2025-08-14', 8),
(224, 'Sent a request from Agora Showroom Main to Warehouse CDO', '09:26', '2025-08-14', 8),
(225, 'Track the request #78', '09:26', '2025-08-14', 8),
(226, 'Track the request #79', '09:26', '2025-08-14', 8),
(227, 'Track the request #79', '09:28', '2025-08-14', 8),
(228, 'Request Stock Out List', '09:45', '2025-08-14', 8),
(229, 'Request Stock Out List', '09:57', '2025-08-14', 8),
(230, 'Request Stock Out List', '09:59', '2025-08-14', 8),
(231, 'Request Stock Out List', '10:00', '2025-08-14', 8),
(232, 'Sent a request from Agora Showroom Main to Warehouse CDO', '10:03', '2025-08-14', 8),
(233, 'Request Stock Out List', '10:05', '2025-08-14', 8),
(234, 'Track the request #80', '10:09', '2025-08-14', 8),
(235, 'Accept the request #80', '10:13', '2025-08-14', 9),
(236, 'Accept the request #79', '10:14', '2025-08-14', 9),
(237, 'Deliver the request #79', '10:19', '2025-08-14', 9),
(238, 'Deliver the request #80', '10:19', '2025-08-14', 9),
(239, 'Track the request #80', '10:21', '2025-08-14', 8),
(240, 'Track the request #80', '10:25', '2025-08-14', 8),
(241, 'Receive the delivery from request #80', '10:26', '2025-08-14', 8),
(242, 'Track the request #80', '10:26', '2025-08-14', 8),
(243, 'Mark the request #80 to complete', '10:27', '2025-08-14', 9),
(244, 'Track the request #80', '10:27', '2025-08-14', 8),
(245, 'Get the inventory reports of Agora Showroom Main', '10:28', '2025-08-14', 8),
(246, 'Sent a request from Agora Showroom Main to Warehouse CDO', '22:14', '2025-08-14', 8),
(247, 'Request Stock Out List', '01:05', '2025-08-15', 8),
(248, 'Request Stock Out List', '01:05', '2025-08-15', 8),
(249, 'Request Stock Out List', '15:15', '2025-08-15', 8),
(250, 'Sent a request from Agora Showroom Main to Warehouse CDO', '15:16', '2025-08-15', 8),
(251, 'Receive the delivery from request #79', '15:21', '2025-08-15', 8),
(252, 'Get the inventory reports of Agora Showroom Main', '15:21', '2025-08-15', 8),
(253, 'Get the inventory reports of Agora Showroom Main', '15:50', '2025-08-15', 8),
(254, 'Get the inventory reports of Agora Showroom Main', '15:50', '2025-08-15', 8),
(255, 'Request Stock Out List', '15:51', '2025-08-15', 8),
(256, 'Log In', '16:09', '2025-08-15', 9),
(257, 'Log In', '16:10', '2025-08-15', 8),
(258, 'Get the inventory reports of Agora Showroom Main', '13:11', '2025-08-16', 9),
(259, 'Get the inventory reports of Warehouse CDO', '13:11', '2025-08-16', 9),
(260, 'Get the inventory reports of Agora Showroom Main', '13:15', '2025-08-16', 9),
(261, 'Get the inventory reports of Warehouse CDO', '13:15', '2025-08-16', 9),
(262, 'Get the inventory reports of Agora Showroom Main', '13:18', '2025-08-16', 9),
(263, 'Get the inventory reports of Warehouse CDO', '13:18', '2025-08-16', 9),
(264, 'Get the inventory reports of Agora Showroom Main', '13:18', '2025-08-16', 9),
(265, 'Get the inventory reports of Agora Showroom Main', '13:18', '2025-08-16', 9),
(266, 'Get the inventory reports of Agora Showroom Main', '13:19', '2025-08-16', 9),
(267, 'Get the inventory reports of Agora Showroom Main', '13:20', '2025-08-16', 9),
(268, 'Get the inventory reports of Warehouse CDO', '13:20', '2025-08-16', 9),
(269, 'Log In', '20:50', '2025-08-18', 9),
(270, 'Accept the request #82', '21:22', '2025-08-18', 9),
(271, 'Log In', '22:12', '2025-08-18', 8),
(272, 'Log In', '22:16', '2025-08-18', 7),
(273, 'Log In', '22:23', '2025-08-18', 7),
(274, 'Deliver the request #82', '22:34', '2025-08-18', 9),
(275, 'Request Stock Out List', '22:34', '2025-08-18', 8),
(276, 'Sent a request from Agora Showroom Main to Warehouse CDO', '22:35', '2025-08-18', 8),
(277, 'Accept the request #83', '22:35', '2025-08-18', 9),
(278, 'Accept the request #81', '22:49', '2025-08-18', 9),
(279, 'Accept the request #74', '22:49', '2025-08-18', 9),
(280, 'Log In', '23:13', '2025-08-18', 8),
(281, 'Log In', '23:14', '2025-08-18', 7),
(282, 'Log In', '23:14', '2025-08-18', 9),
(283, 'Sent a request from Agora Showroom Main to Warehouse CDO', '23:28', '2025-08-18', 8),
(284, 'Sent a request from Agora Showroom Main to Warehouse CDO', '23:28', '2025-08-18', 8),
(285, 'Sent a request from Agora Showroom Main to Warehouse CDO', '23:29', '2025-08-18', 8),
(286, 'Request Stock Out List', '23:49', '2025-08-18', 8),
(287, 'Sent a request from Agora Showroom Main to Warehouse CDO', '23:50', '2025-08-18', 8),
(288, 'Accept the request #87', '00:02', '2025-08-19', 9),
(289, 'Accept the request #86', '00:15', '2025-08-19', 9),
(290, 'Accept the request #85', '00:18', '2025-08-19', 9),
(291, 'Accept the request #84', '00:29', '2025-08-19', 9),
(292, 'Deliver the request #83', '01:24', '2025-08-19', 9),
(293, 'Sent a request from Agora Showroom Main to Warehouse CDO', '01:27', '2025-08-19', 8),
(294, 'Get the inventory reports of Agora Showroom Main', '01:52', '2025-08-19', 9),
(295, 'Get the inventory reports of Warehouse CDO', '01:52', '2025-08-19', 9),
(296, 'Get the inventory reports of Agora Showroom Main', '01:52', '2025-08-19', 9),
(297, 'Get the inventory reports of Warehouse CDO', '01:52', '2025-08-19', 9),
(298, 'Get the inventory reports of Agora Showroom Main', '02:00', '2025-08-19', 9),
(299, 'Get the inventory reports of Warehouse CDO', '02:00', '2025-08-19', 9),
(300, 'Get the inventory reports of Agora Showroom Main', '02:05', '2025-08-19', 9),
(301, 'Get the inventory reports of Warehouse CDO', '02:05', '2025-08-19', 9),
(302, 'Get the inventory reports of Agora Showroom Main', '02:05', '2025-08-19', 9),
(303, 'Mark the request #65 to complete', '03:56', '2025-08-19', 9),
(304, 'Stock In A Product', '12:30', '2025-08-19', 9),
(305, 'Get the inventory reports of Warehouse CDO', '12:30', '2025-08-19', 9),
(306, 'Stock In A Product', '12:31', '2025-08-19', 9),
(307, 'Get the inventory reports of Warehouse CDO', '12:31', '2025-08-19', 9),
(308, 'Mark the request #69 to complete', '14:33', '2025-08-19', 9),
(309, 'Mark the request #70 to complete', '14:33', '2025-08-19', 9),
(310, 'Get the inventory reports of undefined', '14:35', '2025-08-19', 9),
(311, 'Get the inventory reports of undefined', '14:35', '2025-08-19', 9),
(312, 'Get the inventory reports of undefined', '14:35', '2025-08-19', 9),
(313, 'Get the inventory reports of undefined', '14:35', '2025-08-19', 9),
(314, 'Get the inventory reports of undefined', '14:40', '2025-08-19', 9),
(315, 'Get the inventory reports of undefined', '14:40', '2025-08-19', 9),
(316, 'Get the inventory reports of undefined', '14:40', '2025-08-19', 9),
(317, 'Get the inventory reports of undefined', '14:40', '2025-08-19', 9),
(318, 'Get the inventory reports of undefined', '14:40', '2025-08-19', 9),
(319, 'Get the inventory reports of undefined', '14:40', '2025-08-19', 9),
(320, 'Get the inventory reports of undefined', '14:40', '2025-08-19', 9),
(321, 'Get the inventory reports of undefined', '14:40', '2025-08-19', 9),
(322, 'Get the inventory reports of undefined', '14:40', '2025-08-19', 9),
(323, 'Get the inventory reports of undefined', '14:40', '2025-08-19', 9),
(324, 'Get the inventory reports of undefined', '14:40', '2025-08-19', 9),
(325, 'Get the inventory reports of undefined', '14:40', '2025-08-19', 9),
(326, 'Get the inventory reports of undefined', '14:51', '2025-08-19', 9),
(327, 'Get the inventory reports of undefined', '14:51', '2025-08-19', 9),
(328, 'Get the inventory reports of undefined', '14:51', '2025-08-19', 9),
(329, 'Get the inventory reports of undefined', '14:51', '2025-08-19', 9),
(330, 'Get the inventory reports of undefined', '15:00', '2025-08-19', 9),
(331, 'Get the inventory reports of undefined', '15:00', '2025-08-19', 9),
(332, 'Get the inventory reports of undefined', '15:00', '2025-08-19', 9),
(333, 'Get the inventory reports of undefined', '15:00', '2025-08-19', 9),
(334, 'Get the inventory reports of null', '15:09', '2025-08-19', 9),
(335, 'Get the inventory reports of null', '15:09', '2025-08-19', 9),
(336, 'Log Out', '15:10', '2025-08-19', 9),
(337, 'Log In', '15:10', '2025-08-19', 9),
(338, 'Get the inventory reports of Warehouse CDO', '15:10', '2025-08-19', 9),
(339, 'Get the inventory reports of Warehouse CDO', '15:10', '2025-08-19', 9),
(340, 'Get the inventory reports of Warehouse CDO', '15:12', '2025-08-19', 9),
(341, 'Get the inventory reports of Warehouse CDO', '15:12', '2025-08-19', 9),
(342, 'Get the inventory reports of Warehouse CDO', '15:20', '2025-08-19', 9),
(343, 'Get the inventory reports of Warehouse CDO', '15:20', '2025-08-19', 9),
(344, 'Get the inventory reports of Warehouse CDO', '15:20', '2025-08-19', 9),
(345, 'Get the inventory reports of Warehouse CDO', '15:20', '2025-08-19', 9),
(346, 'Get the inventory reports of Warehouse CDO', '15:20', '2025-08-19', 9),
(347, 'Get the inventory reports of Warehouse CDO', '15:20', '2025-08-19', 9),
(348, 'Get the inventory reports of Warehouse CDO', '15:21', '2025-08-19', 9),
(349, 'Get the inventory reports of Warehouse CDO', '15:21', '2025-08-19', 9),
(350, 'Get the inventory reports of Warehouse CDO', '15:21', '2025-08-19', 9),
(351, 'Get the inventory reports of Warehouse CDO', '15:27', '2025-08-19', 9),
(352, 'Get the inventory reports of Warehouse CDO', '15:27', '2025-08-19', 9),
(353, 'Get the inventory reports of Warehouse CDO', '15:29', '2025-08-19', 9),
(354, 'Get the inventory reports of Warehouse CDO', '15:29', '2025-08-19', 9),
(355, 'Get the inventory reports of Warehouse CDO', '15:29', '2025-08-19', 9),
(356, 'Get the inventory reports of Warehouse CDO', '15:29', '2025-08-19', 9),
(357, 'Get the inventory reports of Warehouse CDO', '15:29', '2025-08-19', 9),
(358, 'Get the inventory reports of Warehouse CDO', '15:29', '2025-08-19', 9),
(359, 'Get the inventory reports of Warehouse CDO', '15:30', '2025-08-19', 9),
(360, 'Get the inventory reports of Warehouse CDO', '15:30', '2025-08-19', 9),
(361, 'Get the inventory reports of Warehouse CDO', '15:30', '2025-08-19', 9),
(362, 'Get the inventory reports of Warehouse CDO', '15:30', '2025-08-19', 9),
(363, 'Get the inventory reports of Warehouse CDO', '15:31', '2025-08-19', 9),
(364, 'Get the inventory reports of Warehouse CDO', '15:31', '2025-08-19', 9),
(365, 'Get the inventory reports of Warehouse CDO', '15:31', '2025-08-19', 9),
(366, 'Get the inventory reports of Warehouse CDO', '15:31', '2025-08-19', 9),
(367, 'Get the inventory reports of Warehouse CDO', '15:40', '2025-08-19', 9),
(368, 'Get the inventory reports of Warehouse CDO', '15:40', '2025-08-19', 9),
(369, 'Get the inventory reports of Warehouse CDO', '15:40', '2025-08-19', 9),
(370, 'Get the inventory reports of Warehouse CDO', '15:40', '2025-08-19', 9),
(371, 'Get the inventory reports of Warehouse CDO', '15:44', '2025-08-19', 9),
(372, 'Get the inventory reports of Warehouse CDO', '15:44', '2025-08-19', 9),
(373, 'Get the inventory reports of Warehouse CDO', '15:48', '2025-08-19', 9),
(374, 'Get the inventory reports of Warehouse CDO', '15:48', '2025-08-19', 9),
(375, 'Get the inventory reports of Warehouse CDO', '15:53', '2025-08-19', 9),
(376, 'Get the inventory reports of Warehouse CDO', '15:57', '2025-08-19', 9),
(377, 'Get the inventory reports of Warehouse CDO', '17:55', '2025-08-19', 9),
(378, 'Get the inventory reports of Warehouse CDO', '18:39', '2025-08-19', 9),
(379, 'Get the inventory reports of Warehouse CDO', '18:40', '2025-08-19', 9),
(380, 'Get the inventory reports of Warehouse CDO', '18:42', '2025-08-19', 9),
(381, 'Get the inventory reports of Warehouse CDO', '18:42', '2025-08-19', 9),
(382, 'Get the inventory reports of Warehouse CDO', '18:43', '2025-08-19', 9),
(383, 'Log Out', '18:44', '2025-08-19', 9),
(384, 'Get the inventory reports of Agora Showroom Main', '18:48', '2025-08-19', 8),
(385, 'Get the inventory reports of Warehouse CDO', '18:48', '2025-08-19', 8),
(386, 'Get the inventory reports of Agora Showroom Main', '18:48', '2025-08-19', 8),
(387, 'Track the request #80', '18:48', '2025-08-19', 8),
(388, 'Track the request #67', '18:56', '2025-08-19', 8),
(389, 'Track the request #58', '19:20', '2025-08-19', 8),
(390, 'Track the request #65', '19:20', '2025-08-19', 8),
(391, 'Track the request #58', '19:21', '2025-08-19', 8),
(392, 'Track the request #58', '19:21', '2025-08-19', 8),
(393, 'Track the request #58', '19:21', '2025-08-19', 8),
(394, 'Track the request #58', '19:22', '2025-08-19', 8),
(395, 'Log In', '19:28', '2025-08-19', 9),
(396, 'Track the request #58', '19:33', '2025-08-19', 8),
(397, 'Track the request #61', '19:33', '2025-08-19', 8),
(398, 'Track the request #66', '19:33', '2025-08-19', 8),
(399, 'Track the request #60', '19:33', '2025-08-19', 8),
(400, 'Track the request #58', '19:42', '2025-08-19', 8),
(401, 'Track the request #58', '19:43', '2025-08-19', 8),
(402, 'Get the inventory reports of Agora Showroom Main', '22:41', '2025-08-19', 8),
(403, 'Get the inventory reports of Warehouse CDO', '22:41', '2025-08-19', 8),
(404, 'Get the inventory reports of Agora Showroom Main', '22:41', '2025-08-19', 8),
(405, 'Get the inventory reports of Warehouse CDO', '22:41', '2025-08-19', 8),
(406, 'Track the request #58', '22:43', '2025-08-19', 8),
(407, 'Track the request #59', '22:43', '2025-08-19', 8),
(408, 'Track the request #58', '22:45', '2025-08-19', 8),
(409, 'Track the request #58', '22:45', '2025-08-19', 8),
(410, 'Track the request #58', '22:49', '2025-08-19', 8),
(411, 'Track the request #62', '22:49', '2025-08-19', 8),
(412, 'Track the request #88', '22:49', '2025-08-19', 8),
(413, 'Track the request #58', '23:10', '2025-08-19', 8),
(414, 'Track the request #58', '23:19', '2025-08-19', 8),
(415, 'Track the request #62', '23:20', '2025-08-19', 8),
(416, 'Track the request #74', '23:20', '2025-08-19', 8),
(417, 'Track the request #88', '23:20', '2025-08-19', 8),
(418, 'Log Out', '23:44', '2025-08-19', 8),
(419, 'Log In', '23:44', '2025-08-19', 9),
(420, 'Log Out', '23:45', '2025-08-19', 9),
(421, 'Log In', '23:45', '2025-08-19', 8),
(422, 'Track the request #59', '23:53', '2025-08-19', 8),
(423, 'Track the request #61', '23:53', '2025-08-19', 8),
(424, 'Track the request #63', '23:53', '2025-08-19', 8),
(425, 'Track the request #58', '23:54', '2025-08-19', 8),
(426, 'Track the request #60', '23:54', '2025-08-19', 8),
(427, 'Track the request #59', '23:55', '2025-08-19', 8),
(428, 'Track the request #60', '23:55', '2025-08-19', 8),
(429, 'Track the request #58', '23:55', '2025-08-19', 8),
(430, 'Track the request #62', '23:55', '2025-08-19', 8),
(431, 'Track the request #58', '23:55', '2025-08-19', 8),
(432, 'Track the request #58', '23:59', '2025-08-19', 8),
(433, 'Track the request #58', '23:59', '2025-08-19', 8),
(434, 'Track the request #58', '00:00', '2025-08-20', 8),
(435, 'Track the request #58', '00:04', '2025-08-20', 8),
(436, 'Track the request #63', '00:05', '2025-08-20', 8),
(437, 'Track the request #59', '00:13', '2025-08-20', 8),
(438, 'Track the request #58', '00:14', '2025-08-20', 8),
(439, 'Track the request #58', '00:14', '2025-08-20', 8),
(440, 'Track the request #62', '00:15', '2025-08-20', 8),
(441, 'Track the request #59', '00:21', '2025-08-20', 8),
(442, 'Get the inventory reports of Warehouse CDO', '13:36', '2025-08-20', 9),
(443, 'Get the inventory reports of Warehouse CDO', '13:36', '2025-08-20', 9),
(444, 'Get the inventory reports of Warehouse CDO', '13:46', '2025-08-20', 8),
(445, 'Get the inventory reports of Agora Showroom Main', '13:46', '2025-08-20', 8),
(446, 'Get the inventory reports of Warehouse CDO', '13:47', '2025-08-20', 8),
(447, 'Track the request #59', '13:57', '2025-08-20', 8),
(448, 'Request Stock Out List', '14:15', '2025-08-20', 8),
(449, 'Request Stock Out List', '14:23', '2025-08-20', 8),
(450, 'Track the request #58', '14:27', '2025-08-20', 8),
(451, 'Track the request #62', '14:27', '2025-08-20', 8),
(452, 'Log In', '15:30', '2025-08-20', 8),
(453, 'Log In', '15:31', '2025-08-20', 8),
(454, 'Get the inventory reports of Warehouse CDO', '15:34', '2025-08-20', 9),
(455, 'Get the inventory reports of Warehouse CDO', '15:35', '2025-08-20', 9),
(456, 'Get the inventory reports of Warehouse CDO', '15:43', '2025-08-20', 9),
(457, 'Get the inventory reports of Warehouse CDO', '15:45', '2025-08-20', 9),
(458, 'Get the inventory reports of Warehouse CDO', '15:47', '2025-08-20', 9),
(459, 'Get the inventory reports of Agora Showroom Main', '15:53', '2025-08-20', 8),
(460, 'Get the inventory reports of Agora Showroom Main', '15:54', '2025-08-20', 8),
(461, 'Get the inventory reports of Warehouse CDO', '15:54', '2025-08-20', 8),
(462, 'Get the inventory reports of Warehouse CDO', '15:58', '2025-08-20', 8),
(463, 'Get the inventory reports of Agora Showroom Main', '15:58', '2025-08-20', 8),
(464, 'Get the inventory reports of Agora Showroom Main', '15:58', '2025-08-20', 8),
(465, 'Get the inventory reports of Warehouse CDO', '15:58', '2025-08-20', 8),
(466, 'Get the inventory reports of Agora Showroom Main', '15:58', '2025-08-20', 8),
(467, 'Get the inventory reports of Warehouse CDO', '15:58', '2025-08-20', 8),
(468, 'Get the inventory reports of Agora Showroom Main', '15:58', '2025-08-20', 8),
(469, 'Get the inventory reports of Warehouse CDO', '16:15', '2025-08-20', 9),
(470, 'Get the inventory reports of Warehouse CDO', '16:15', '2025-08-20', 9),
(471, 'Request Stock Out List', '11:12', '2025-08-21', 8),
(472, 'Sent a request from Agora Showroom Main to Warehouse CDO', '11:13', '2025-08-21', 8),
(473, 'Sent a request from Agora Showroom Main to Warehouse CDO', '11:14', '2025-08-21', 8),
(474, 'Log In', '12:16', '2025-08-21', 9),
(475, 'Get the inventory reports of Warehouse CDO', '12:22', '2025-08-21', 9),
(476, 'Get the inventory reports of Warehouse CDO', '12:23', '2025-08-21', 9),
(477, 'Log In', '12:27', '2025-08-21', 8),
(478, 'Log In', '12:28', '2025-08-21', 9),
(479, 'Log In', '12:28', '2025-08-21', 8),
(480, 'Get the inventory reports of Agora Showroom Main', '12:35', '2025-08-21', 8),
(481, 'Get the inventory reports of Warehouse CDO', '12:35', '2025-08-21', 9),
(482, 'Get the inventory reports of Warehouse CDO', '12:37', '2025-08-21', 9),
(483, 'Get the inventory reports of Warehouse CDO', '12:37', '2025-08-21', 9),
(484, 'Track the request #58', '12:38', '2025-08-21', 8),
(485, 'Track the request #61', '12:38', '2025-08-21', 8),
(486, 'Track the request #59', '12:38', '2025-08-21', 8),
(487, 'Track the request #58', '12:39', '2025-08-21', 8),
(488, 'Track the request #58', '12:39', '2025-08-21', 8),
(489, 'Track the request #60', '12:39', '2025-08-21', 8),
(490, 'Track the request #63', '12:39', '2025-08-21', 8),
(491, 'Track the request #61', '12:40', '2025-08-21', 8),
(492, 'Track the request #64', '12:40', '2025-08-21', 8),
(493, 'Track the request #65', '12:40', '2025-08-21', 8),
(494, 'Track the request #58', '12:40', '2025-08-21', 8),
(495, 'Track the request #67', '12:40', '2025-08-21', 8),
(496, 'Track the request #78', '12:40', '2025-08-21', 8),
(497, 'Track the request #66', '12:40', '2025-08-21', 8),
(498, 'Track the request #65', '12:40', '2025-08-21', 8),
(499, 'Track the request #64', '12:40', '2025-08-21', 8),
(500, 'Track the request #63', '12:40', '2025-08-21', 8),
(501, 'Track the request #61', '12:40', '2025-08-21', 8),
(502, 'Track the request #68', '12:40', '2025-08-21', 8),
(503, 'Track the request #69', '12:40', '2025-08-21', 8),
(504, 'Track the request #72', '12:40', '2025-08-21', 8),
(505, 'Request Stock Out List', '12:41', '2025-08-21', 8),
(506, 'Get the inventory reports of Warehouse CDO', '12:53', '2025-08-21', 9),
(507, 'Track the request #59', '13:00', '2025-08-21', 8),
(508, 'Request Stock Out List', '13:00', '2025-08-21', 8),
(509, 'Get the inventory reports of Agora Showroom Main', '13:04', '2025-08-21', 8),
(510, 'Request Stock Out List', '13:04', '2025-08-21', 8),
(511, 'Accept the request #90', '13:05', '2025-08-21', 9),
(512, 'Request Stock Out List', '13:06', '2025-08-21', 8),
(513, 'Track the request #58', '13:09', '2025-08-21', 8),
(514, 'Track the request #58', '13:13', '2025-08-21', 8),
(515, 'Track the request #58', '13:22', '2025-08-21', 8),
(516, 'Get the inventory reports of Agora Showroom Main', '13:23', '2025-08-21', 8),
(517, 'Track the request #62', '13:24', '2025-08-21', 8),
(518, 'Sent a request from Agora Showroom Main to Warehouse CDO', '13:25', '2025-08-21', 8),
(519, 'Get the inventory reports of Warehouse CDO', '13:26', '2025-08-21', 9),
(520, 'Accept the request #91', '13:27', '2025-08-21', 9),
(521, 'Deliver the request #91', '13:27', '2025-08-21', 9),
(522, 'Receive the delivery from request #83', '13:27', '2025-08-21', 8),
(523, 'Track the request #91', '13:28', '2025-08-21', 8),
(524, 'Track the request #91', '13:28', '2025-08-21', 8),
(525, 'Receive the delivery from request #91', '13:28', '2025-08-21', 8),
(526, 'Track the request #91', '13:28', '2025-08-21', 8),
(527, 'Mark the request #91 to complete', '13:28', '2025-08-21', 9),
(528, 'Track the request #91', '13:28', '2025-08-21', 8),
(529, 'Track the request #91', '13:29', '2025-08-21', 8),
(530, 'Log In', '13:40', '2025-08-21', 9),
(531, 'Mark the request #83 to complete', '13:41', '2025-08-21', 9),
(532, 'Sent a request from Agora Showroom Main to Warehouse CDO', '13:42', '2025-08-21', 8),
(533, 'Accept the request #92', '13:43', '2025-08-21', 9),
(534, 'Deliver the request #92', '13:43', '2025-08-21', 9),
(535, 'Track the request #92', '13:43', '2025-08-21', 8),
(536, 'Receive the delivery from request #92', '13:43', '2025-08-21', 8),
(537, 'Track the request #92', '13:43', '2025-08-21', 8),
(538, 'Track the request #92', '13:44', '2025-08-21', 8),
(539, 'Mark the request #92 to complete', '13:44', '2025-08-21', 9),
(540, 'Track the request #92', '13:44', '2025-08-21', 8),
(541, 'Sent a request from Agora Showroom Main to Warehouse CDO', '13:54', '2025-08-21', 8),
(542, 'Request Stock Out List', '13:56', '2025-08-21', 8),
(543, 'Log Out', '13:57', '2025-08-21', 8),
(544, 'Log In', '13:58', '2025-08-21', 8),
(545, 'Get the inventory reports of Agora Showroom Main', '14:03', '2025-08-21', 8),
(546, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-08-21', 9),
(547, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-08-21', 9),
(548, 'Get the inventory reports of Agora Showroom Main', '14:04', '2025-08-21', 8),
(549, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-08-21', 8),
(550, 'Track the request #74', '14:07', '2025-08-21', 8),
(551, 'Track the request #74', '14:07', '2025-08-21', 8),
(552, 'Track the request #74', '14:07', '2025-08-21', 8),
(553, 'Track the request #74', '14:09', '2025-08-21', 8),
(554, 'Sent a request from Agora Showroom Main to Warehouse CDO', '14:11', '2025-08-21', 8),
(555, 'Accept the request #93', '14:11', '2025-08-21', 9),
(556, 'Accept the request #88', '14:11', '2025-08-21', 9),
(557, 'Stock In A Product', '14:14', '2025-08-21', 9),
(558, 'Get the inventory reports of Warehouse CDO', '14:14', '2025-08-21', 9),
(559, 'Accept the request #94', '14:15', '2025-08-21', 9),
(560, 'Deliver the request #94', '14:15', '2025-08-21', 9),
(561, 'Receive the delivery from request #94', '14:16', '2025-08-21', 8),
(562, 'Track the request #58', '14:18', '2025-08-21', 8),
(563, 'Mark the request #94 to complete', '14:19', '2025-08-21', 9),
(564, 'Mark the request #79 to complete', '14:19', '2025-08-21', 9),
(565, 'Request Stock Out List', '14:20', '2025-08-21', 8),
(566, 'Request Stock Out List', '14:20', '2025-08-21', 8),
(567, 'Request Stock Out List', '14:24', '2025-08-21', 8),
(568, 'Request Stock Out List', '14:25', '2025-08-21', 8),
(569, 'Track the request #58', '14:29', '2025-08-21', 8),
(570, 'Track the request #74', '14:29', '2025-08-21', 8),
(571, 'Track the request #74', '14:30', '2025-08-21', 8),
(572, 'Track the request #74', '14:30', '2025-08-21', 8),
(573, 'Get the inventory reports of Warehouse CDO', '14:31', '2025-08-21', 9),
(574, 'Get the inventory reports of Warehouse CDO', '14:31', '2025-08-21', 9),
(575, 'Request Stock Out List', '14:31', '2025-08-21', 8),
(576, 'Request Stock Out List', '14:41', '2025-08-21', 8),
(577, 'Sent a request from Agora Showroom Main to Warehouse CDO', '14:42', '2025-08-21', 8),
(578, 'Request Stock Out List', '14:47', '2025-08-21', 8),
(579, 'Request Stock Out List', '14:47', '2025-08-21', 8),
(580, 'Request Stock Out List', '14:47', '2025-08-21', 8),
(581, 'Request Stock Out List', '15:33', '2025-08-21', 8),
(582, 'Request Stock Out List', '15:49', '2025-08-21', 8),
(583, 'Request Stock Out List', '15:52', '2025-08-21', 8),
(584, 'Request Stock Out List', '17:05', '2025-08-21', 8),
(585, 'Request Stock Out List', '17:09', '2025-08-21', 8),
(586, 'Request Stock Out List', '17:37', '2025-08-21', 8),
(587, 'Request Stock Out List', '17:47', '2025-08-21', 8),
(588, 'Log In', '17:49', '2025-08-21', 7),
(589, 'Get the inventory reports of Agora Showroom Main', '19:38', '2025-08-21', 8),
(590, 'Get the inventory reports of Warehouse CDO', '19:38', '2025-08-21', 8),
(591, 'Get the inventory reports of Agora Showroom Main', '19:38', '2025-08-21', 8),
(592, 'Get the inventory reports of Warehouse CDO', '19:38', '2025-08-21', 8),
(593, 'Get the inventory reports of Agora Showroom Main', '19:45', '2025-08-21', 8),
(594, 'Get the inventory reports of Warehouse CDO', '19:45', '2025-08-21', 8),
(595, 'Get the inventory reports of Agora Showroom Main', '19:45', '2025-08-21', 8),
(596, 'Get the inventory reports of null', '19:48', '2025-08-21', 8),
(597, 'Get the inventory reports of null', '19:48', '2025-08-21', 8),
(598, 'Get the inventory reports of null', '19:48', '2025-08-21', 8),
(599, 'Get the inventory reports of null', '19:48', '2025-08-21', 8),
(600, 'Log Out', '19:49', '2025-08-21', 8),
(601, 'Log In', '19:49', '2025-08-21', 8),
(602, 'Get the inventory reports of Agora Showroom Main', '19:49', '2025-08-21', 8),
(603, 'Get the inventory reports of Agora Showroom Main', '19:49', '2025-08-21', 8),
(604, 'Get the inventory reports of Agora Showroom Main', '19:53', '2025-08-21', 8),
(605, 'Get the inventory reports of Agora Showroom Main', '19:57', '2025-08-21', 8),
(606, 'Track the request #58', '19:57', '2025-08-21', 8),
(607, 'Track the request #62', '19:57', '2025-08-21', 8),
(608, 'Get the inventory reports of Agora Showroom Main', '20:15', '2025-08-21', 8),
(609, 'Get the inventory reports of Warehouse CDO', '20:35', '2025-08-21', 9),
(610, 'Track the request #95', '21:03', '2025-08-21', 8),
(611, 'Track the request #89', '21:03', '2025-08-21', 8),
(612, 'Track the request #58', '21:03', '2025-08-21', 8),
(613, 'Track the request #58', '21:03', '2025-08-21', 8),
(614, 'Track the request #58', '21:05', '2025-08-21', 8),
(615, 'Get the inventory reports of Warehouse CDO', '21:08', '2025-08-21', 9),
(616, 'Get the inventory reports of Warehouse CDO', '21:21', '2025-08-21', 9),
(617, 'Get the inventory reports of Warehouse CDO', '21:25', '2025-08-21', 9),
(618, 'Get the inventory reports of Warehouse CDO', '21:26', '2025-08-21', 9),
(619, 'Get the inventory reports of Warehouse CDO', '21:26', '2025-08-21', 9),
(620, 'Get the inventory reports of Warehouse CDO', '21:31', '2025-08-21', 9),
(621, 'Get the inventory reports of Warehouse CDO', '21:37', '2025-08-21', 9),
(622, 'Get the inventory reports of Warehouse CDO', '22:10', '2025-08-21', 9),
(623, 'Get the inventory reports of Warehouse CDO', '22:10', '2025-08-21', 9),
(624, 'Track the request #74', '22:14', '2025-08-21', 8),
(625, 'Track the request #95', '22:14', '2025-08-21', 8),
(626, 'Track the request #89', '22:14', '2025-08-21', 8),
(627, 'Log In', '22:33', '2025-08-21', 12),
(628, 'Log In', '14:47', '2025-08-22', 12),
(629, 'Log In', '15:48', '2025-08-22', 7),
(630, 'Log In', '16:25', '2025-08-22', 8),
(631, 'Get the inventory reports of Agora Showroom Main', '17:01', '2025-08-23', 8),
(632, 'Track the request #58', '17:02', '2025-08-23', 8),
(633, 'Track the request #62', '17:02', '2025-08-23', 8),
(634, 'Track the request #62', '17:02', '2025-08-23', 8),
(635, 'Track the request #62', '17:02', '2025-08-23', 8),
(636, 'Track the request #62', '17:02', '2025-08-23', 8),
(637, 'Track the request #61', '17:02', '2025-08-23', 8),
(638, 'Track the request #73', '17:02', '2025-08-23', 8),
(639, 'Track the request #73', '17:02', '2025-08-23', 8),
(640, 'Track the request #71', '17:02', '2025-08-23', 8),
(641, 'Track the request #62', '17:03', '2025-08-23', 8),
(642, 'Track the request #61', '17:04', '2025-08-23', 8),
(643, 'Track the request #62', '17:04', '2025-08-23', 8),
(644, 'Track the request #62', '17:04', '2025-08-23', 8),
(645, 'Log In', '17:05', '2025-08-23', 9),
(646, 'Track the request #71', '17:05', '2025-08-23', 8),
(647, 'Deliver the request #81', '17:06', '2025-08-23', 9),
(648, 'Receive the delivery from request #81', '17:07', '2025-08-23', 8),
(649, 'Mark the request #81 to complete', '17:08', '2025-08-23', 9),
(650, 'Track the request #81', '17:08', '2025-08-23', 8),
(651, 'Track the request #81', '17:08', '2025-08-23', 8),
(652, 'Receive the delivery from request #78', '17:12', '2025-08-23', 8),
(653, 'Get the inventory reports of Agora Showroom Main', '17:13', '2025-08-23', 8),
(654, 'Get the inventory reports of Warehouse CDO', '17:19', '2025-08-23', 9),
(655, 'Get the inventory reports of Warehouse CDO', '17:25', '2025-08-23', 9),
(656, 'Get the inventory reports of Warehouse CDO', '17:31', '2025-08-23', 9),
(657, 'Get the inventory reports of Warehouse CDO', '17:31', '2025-08-23', 9),
(658, 'Get the inventory reports of Agora Showroom Main', '17:38', '2025-08-23', 8),
(659, 'Get the inventory reports of Warehouse CDO', '17:38', '2025-08-23', 9),
(660, 'Stock In A Product', '17:42', '2025-08-23', 9),
(661, 'Get the inventory reports of Warehouse CDO', '17:43', '2025-08-23', 9),
(662, 'Deliver the request #90', '17:43', '2025-08-23', 9),
(663, 'Mark the request #77 to complete', '17:43', '2025-08-23', 9),
(664, 'Get the inventory reports of Agora Showroom Main', '17:44', '2025-08-23', 8),
(665, 'Get the inventory reports of Agora Showroom Main', '17:44', '2025-08-23', 8),
(666, 'Get the inventory reports of Agora Showroom Main', '17:45', '2025-08-23', 8),
(667, 'Get the inventory reports of Agora Showroom Main', '17:45', '2025-08-23', 8),
(668, 'Sent a request from Agora Showroom Main to Warehouse CDO', '17:46', '2025-08-23', 8),
(669, 'Track the request #58', '17:46', '2025-08-23', 8),
(670, 'Get the inventory reports of Agora Showroom Main', '17:46', '2025-08-23', 8),
(671, 'Accept the request #96', '17:47', '2025-08-23', 9),
(672, 'Accept the request #96', '17:47', '2025-08-23', 9),
(673, 'Accept the request #96', '17:47', '2025-08-23', 9),
(674, 'Accept the request #96', '17:47', '2025-08-23', 9),
(675, 'Accept the request #96', '17:47', '2025-08-23', 9),
(676, 'Accept the request #96', '17:47', '2025-08-23', 9),
(677, 'Accept the request #96', '17:47', '2025-08-23', 9),
(678, 'Accept the request #96', '17:47', '2025-08-23', 9),
(679, 'Deliver the request #96', '17:47', '2025-08-23', 9),
(680, 'Receive the delivery from request #96', '17:48', '2025-08-23', 8),
(681, 'Get the inventory reports of Agora Showroom Main', '17:48', '2025-08-23', 8),
(682, 'Get the inventory reports of Warehouse CDO', '17:49', '2025-08-23', 9),
(683, 'Get the inventory reports of Agora Showroom Main', '17:52', '2025-08-23', 8),
(684, 'Get the inventory reports of Agora Showroom Main', '17:52', '2025-08-23', 8),
(685, 'Get the inventory reports of Agora Showroom Main', '17:52', '2025-08-23', 8),
(686, 'Get the inventory reports of Warehouse CDO', '17:52', '2025-08-23', 9),
(687, 'Get the inventory reports of Warehouse CDO', '17:52', '2025-08-23', 9),
(688, 'Get the inventory reports of Warehouse CDO', '17:52', '2025-08-23', 9),
(689, 'Log Out', '17:54', '2025-08-23', 9),
(690, 'Log Out', '17:54', '2025-08-23', 8),
(691, 'Log Out', '17:54', '2025-08-23', 7),
(692, 'Log Out', '17:54', '2025-08-23', 12),
(693, 'Log In', '20:09', '2025-08-25', 9),
(694, 'Get the inventory reports of Warehouse CDO', '20:09', '2025-08-25', 9),
(695, 'Get the inventory reports of Warehouse CDO', '20:09', '2025-08-25', 9),
(696, 'Get the inventory reports of Warehouse CDO', '20:16', '2025-08-25', 9),
(697, 'Get the inventory reports of Warehouse CDO', '20:17', '2025-08-25', 9),
(698, 'Get the inventory reports of Warehouse CDO', '20:20', '2025-08-25', 9),
(699, 'Get the inventory reports of Warehouse CDO', '20:32', '2025-08-25', 9),
(700, 'Get the inventory reports of Warehouse CDO', '20:34', '2025-08-25', 9),
(701, 'Get the inventory reports of Warehouse CDO', '20:35', '2025-08-25', 9),
(702, 'Get the inventory reports of Warehouse CDO', '20:36', '2025-08-25', 9),
(703, 'Get the inventory reports of Warehouse CDO', '20:41', '2025-08-25', 9),
(704, 'Get the inventory reports of Warehouse CDO', '20:41', '2025-08-25', 9),
(705, 'Get the inventory reports of Warehouse CDO', '20:58', '2025-08-25', 9),
(706, 'Get the inventory reports of Warehouse CDO', '22:38', '2025-08-25', 9),
(707, 'Get the inventory reports of Warehouse CDO', '22:38', '2025-08-25', 9),
(708, 'Get the inventory reports of Warehouse CDO', '22:56', '2025-08-25', 9),
(709, 'Get the inventory reports of Warehouse CDO', '22:56', '2025-08-25', 9),
(710, 'Get the inventory reports of Warehouse CDO', '23:04', '2025-08-25', 9),
(711, 'Get the inventory reports of Warehouse CDO', '23:04', '2025-08-25', 9),
(712, 'Get the inventory reports of Warehouse CDO', '23:04', '2025-08-25', 9),
(713, 'Get the inventory reports of Warehouse CDO', '23:04', '2025-08-25', 9),
(714, 'Get the inventory reports of Warehouse CDO', '23:04', '2025-08-25', 9),
(715, 'Get the inventory reports of Warehouse CDO', '23:04', '2025-08-25', 9),
(716, 'Get the inventory reports of Warehouse CDO', '23:04', '2025-08-25', 9),
(717, 'Get the inventory reports of Warehouse CDO', '23:04', '2025-08-25', 9),
(718, 'Get the inventory reports of Warehouse CDO', '23:10', '2025-08-25', 9),
(719, 'Get the inventory reports of Warehouse CDO', '23:10', '2025-08-25', 9),
(720, 'Get the inventory reports of Warehouse CDO', '23:10', '2025-08-25', 9),
(721, 'Get the inventory reports of Warehouse CDO', '23:10', '2025-08-25', 9),
(722, 'Log In', '23:14', '2025-08-25', 12),
(723, 'Get the inventory reports of Warehouse CDO', '23:17', '2025-08-25', 9),
(724, 'Get the inventory reports of Warehouse CDO', '23:17', '2025-08-25', 9),
(725, 'Get the inventory reports of Warehouse CDO', '23:17', '2025-08-25', 9),
(726, 'Get the inventory reports of Warehouse CDO', '23:17', '2025-08-25', 9),
(727, 'Get the inventory reports of Warehouse CDO', '23:25', '2025-08-25', 9),
(728, 'Get the inventory reports of Warehouse CDO', '23:25', '2025-08-25', 9),
(729, 'Get the inventory reports of Warehouse CDO', '23:25', '2025-08-25', 9),
(730, 'Get the inventory reports of Warehouse CDO', '23:25', '2025-08-25', 9),
(731, 'Get the inventory reports of Warehouse CDO', '23:25', '2025-08-25', 9),
(732, 'Get the inventory reports of Warehouse CDO', '23:25', '2025-08-25', 9),
(733, 'Get the inventory reports of Warehouse CDO', '23:25', '2025-08-25', 9),
(734, 'Get the inventory reports of Warehouse CDO', '23:25', '2025-08-25', 9),
(735, 'Get the inventory reports of Warehouse CDO', '23:26', '2025-08-25', 9),
(736, 'Get the inventory reports of Warehouse CDO', '23:26', '2025-08-25', 9),
(737, 'Get the inventory reports of Warehouse CDO', '23:26', '2025-08-25', 9),
(738, 'Get the inventory reports of Warehouse CDO', '23:26', '2025-08-25', 9),
(739, 'Get the inventory reports of Warehouse CDO', '23:26', '2025-08-25', 9),
(740, 'Get the inventory reports of Warehouse CDO', '23:26', '2025-08-25', 9),
(741, 'Get the inventory reports of Warehouse CDO', '23:26', '2025-08-25', 9),
(742, 'Get the inventory reports of Warehouse CDO', '23:26', '2025-08-25', 9),
(743, 'Get the inventory reports of Warehouse CDO', '23:27', '2025-08-25', 9),
(744, 'Get the inventory reports of Warehouse CDO', '23:27', '2025-08-25', 9),
(745, 'Get the inventory reports of Warehouse CDO', '23:27', '2025-08-25', 9),
(746, 'Get the inventory reports of Warehouse CDO', '23:27', '2025-08-25', 9),
(747, 'Get the inventory reports of Warehouse CDO', '23:27', '2025-08-25', 9),
(748, 'Get the inventory reports of Warehouse CDO', '23:27', '2025-08-25', 9),
(749, 'Get the inventory reports of Warehouse CDO', '23:27', '2025-08-25', 9),
(750, 'Get the inventory reports of Warehouse CDO', '23:27', '2025-08-25', 9),
(751, 'Get the inventory reports of Warehouse CDO', '23:30', '2025-08-25', 9),
(752, 'Get the inventory reports of Warehouse CDO', '23:30', '2025-08-25', 9),
(753, 'Get the inventory reports of Warehouse CDO', '23:30', '2025-08-25', 9),
(754, 'Get the inventory reports of Warehouse CDO', '23:30', '2025-08-25', 9),
(755, 'Get the inventory reports of Warehouse CDO', '23:31', '2025-08-25', 9),
(756, 'Get the inventory reports of Warehouse CDO', '23:31', '2025-08-25', 9),
(757, 'Get the inventory reports of Warehouse CDO', '23:31', '2025-08-25', 9),
(758, 'Get the inventory reports of Warehouse CDO', '23:31', '2025-08-25', 9),
(759, 'Get the inventory reports of Warehouse CDO', '23:31', '2025-08-25', 9),
(760, 'Get the inventory reports of Warehouse CDO', '23:31', '2025-08-25', 9),
(761, 'Get the inventory reports of Warehouse CDO', '23:31', '2025-08-25', 9),
(762, 'Get the inventory reports of Warehouse CDO', '23:31', '2025-08-25', 9),
(763, 'Get the inventory reports of Warehouse CDO', '23:41', '2025-08-25', 9),
(764, 'Get the inventory reports of Warehouse CDO', '23:41', '2025-08-25', 9),
(765, 'Get the inventory reports of Warehouse CDO', '23:41', '2025-08-25', 9),
(766, 'Get the inventory reports of Warehouse CDO', '23:41', '2025-08-25', 9),
(767, 'Get the inventory reports of Warehouse CDO', '23:41', '2025-08-25', 9),
(768, 'Get the inventory reports of Warehouse CDO', '23:41', '2025-08-25', 9),
(769, 'Get the inventory reports of Warehouse CDO', '23:41', '2025-08-25', 9);
INSERT INTO `activity_log` (`activity_log_id`, `activity`, `time`, `date`, `account_id`) VALUES
(770, 'Get the inventory reports of Warehouse CDO', '23:41', '2025-08-25', 9),
(771, 'Get the inventory reports of Warehouse CDO', '23:45', '2025-08-25', 9),
(772, 'Get the inventory reports of Warehouse CDO', '23:45', '2025-08-25', 9),
(773, 'Get the inventory reports of Warehouse CDO', '23:45', '2025-08-25', 9),
(774, 'Get the inventory reports of Warehouse CDO', '23:45', '2025-08-25', 9),
(775, 'Get the inventory reports of Warehouse CDO', '23:46', '2025-08-25', 9),
(776, 'Get the inventory reports of Warehouse CDO', '23:46', '2025-08-25', 9),
(777, 'Get the inventory reports of Warehouse CDO', '23:46', '2025-08-25', 9),
(778, 'Get the inventory reports of Warehouse CDO', '23:46', '2025-08-25', 9),
(779, 'Get the inventory reports of Warehouse CDO', '00:33', '2025-08-26', 9),
(780, 'Get the inventory reports of Warehouse CDO', '00:33', '2025-08-26', 9),
(781, 'Get the inventory reports of Warehouse CDO', '00:33', '2025-08-26', 9),
(782, 'Get the inventory reports of Warehouse CDO', '00:33', '2025-08-26', 9),
(783, 'Get the inventory reports of Warehouse CDO', '00:33', '2025-08-26', 9),
(784, 'Get the inventory reports of Warehouse CDO', '00:33', '2025-08-26', 9),
(785, 'Get the inventory reports of Warehouse CDO', '00:33', '2025-08-26', 9),
(786, 'Get the inventory reports of Warehouse CDO', '00:33', '2025-08-26', 9),
(787, 'Get the inventory reports of Warehouse CDO', '00:34', '2025-08-26', 9),
(788, 'Get the inventory reports of Warehouse CDO', '00:34', '2025-08-26', 9),
(789, 'Get the inventory reports of Warehouse CDO', '00:34', '2025-08-26', 9),
(790, 'Get the inventory reports of Warehouse CDO', '00:34', '2025-08-26', 9),
(791, 'Get the inventory reports of Warehouse CDO', '00:45', '2025-08-26', 9),
(792, 'Get the inventory reports of Warehouse CDO', '00:45', '2025-08-26', 9),
(793, 'Get the inventory reports of Warehouse CDO', '00:45', '2025-08-26', 9),
(794, 'Get the inventory reports of Warehouse CDO', '00:45', '2025-08-26', 9),
(795, 'Get the inventory reports of Warehouse CDO', '00:53', '2025-08-26', 9),
(796, 'Get the inventory reports of Warehouse CDO', '00:53', '2025-08-26', 9),
(797, 'Get the inventory reports of Warehouse CDO', '00:53', '2025-08-26', 9),
(798, 'Get the inventory reports of Warehouse CDO', '00:53', '2025-08-26', 9),
(799, 'Get the inventory reports of Warehouse CDO', '00:53', '2025-08-26', 9),
(800, 'Get the inventory reports of Warehouse CDO', '00:53', '2025-08-26', 9),
(801, 'Get the inventory reports of Warehouse CDO', '00:53', '2025-08-26', 9),
(802, 'Get the inventory reports of Warehouse CDO', '00:53', '2025-08-26', 9),
(803, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-08-26', 9),
(804, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-08-26', 9),
(805, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-08-26', 9),
(806, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-08-26', 9),
(807, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-08-26', 9),
(808, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-08-26', 9),
(809, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-08-26', 9),
(810, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-08-26', 9),
(811, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-08-26', 9),
(812, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-08-26', 9),
(813, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-08-26', 9),
(814, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-08-26', 9),
(815, 'Log In', '00:57', '2025-08-26', 8),
(816, 'Get the inventory reports of Agora Showroom Main', '00:57', '2025-08-26', 8),
(817, 'Get the inventory reports of Agora Showroom Main', '00:59', '2025-08-26', 8),
(818, 'Log In', '00:59', '2025-08-26', 7),
(819, 'Get the inventory reports of Agora Showroom Main', '01:00', '2025-08-26', 8),
(820, 'Get the inventory reports of Agora Showroom Main', '01:01', '2025-08-26', 8),
(821, 'Get the inventory reports of Agora Showroom Main', '01:02', '2025-08-26', 8),
(822, 'Get the inventory reports of Agora Showroom Main', '01:04', '2025-08-26', 8),
(823, 'Get the inventory reports of Agora Showroom Main', '01:08', '2025-08-26', 8),
(824, 'Get the inventory reports of Agora Showroom Main', '01:08', '2025-08-26', 8),
(825, 'Get the inventory reports of Agora Showroom Main', '01:08', '2025-08-26', 8),
(826, 'Get the inventory reports of Agora Showroom Main', '01:08', '2025-08-26', 8),
(827, 'Get the inventory reports of Agora Showroom Main', '01:08', '2025-08-26', 8),
(828, 'Get the inventory reports of Agora Showroom Main', '01:08', '2025-08-26', 8),
(829, 'Get the inventory reports of Agora Showroom Main', '01:11', '2025-08-26', 8),
(830, 'Get the inventory reports of Agora Showroom Main', '01:11', '2025-08-26', 8),
(831, 'Get the inventory reports of Agora Showroom Main', '01:11', '2025-08-26', 8),
(832, 'Get the inventory reports of Agora Showroom Main', '01:11', '2025-08-26', 8),
(833, 'Log In', '01:18', '2025-08-26', 16),
(834, 'Get the inventory reports of Agora Showroom Main', '01:25', '2025-08-26', 8),
(835, 'Get the inventory reports of Agora Showroom Main', '01:25', '2025-08-26', 8),
(836, 'Get the inventory reports of Agora Showroom Main', '01:25', '2025-08-26', 8),
(837, 'Get the inventory reports of Agora Showroom Main', '01:25', '2025-08-26', 8),
(838, 'Get the inventory reports of Agora Showroom Main', '01:26', '2025-08-26', 8),
(839, 'Get the inventory reports of Agora Showroom Main', '01:26', '2025-08-26', 8),
(840, 'Get the inventory reports of Agora Showroom Main', '01:26', '2025-08-26', 8),
(841, 'Get the inventory reports of Agora Showroom Main', '01:26', '2025-08-26', 8),
(842, 'Log Out', '01:28', '2025-08-26', 8),
(843, 'Log In', '01:29', '2025-08-26', 8),
(844, 'Get the inventory reports of Agora Showroom Main', '01:29', '2025-08-26', 8),
(845, 'Get the inventory reports of Agora Showroom Main', '01:29', '2025-08-26', 8),
(846, 'Get the inventory reports of Agora Showroom Main', '01:29', '2025-08-26', 8),
(847, 'Get the inventory reports of Agora Showroom Main', '01:29', '2025-08-26', 8),
(848, 'Log In', '16:35', '2025-08-26', 9),
(849, 'Get the inventory reports of Warehouse CDO', '16:35', '2025-08-26', 9),
(850, 'Get the inventory reports of Warehouse CDO', '16:35', '2025-08-26', 9),
(851, 'Get the inventory reports of Warehouse CDO', '16:35', '2025-08-26', 9),
(852, 'Get the inventory reports of Warehouse CDO', '16:35', '2025-08-26', 9),
(853, 'Get the inventory reports of Warehouse CDO', '16:35', '2025-08-26', 9),
(854, 'Get the inventory reports of Warehouse CDO', '16:35', '2025-08-26', 9),
(855, 'Get the inventory reports of Warehouse CDO', '16:35', '2025-08-26', 9),
(856, 'Get the inventory reports of Warehouse CDO', '16:35', '2025-08-26', 9),
(857, 'Log In', '16:38', '2025-08-26', 8),
(858, 'Get the inventory reports of Agora Showroom Main', '16:38', '2025-08-26', 8),
(859, 'Get the inventory reports of Agora Showroom Main', '16:38', '2025-08-26', 8),
(860, 'Get the inventory reports of Agora Showroom Main', '16:38', '2025-08-26', 8),
(861, 'Get the inventory reports of Agora Showroom Main', '16:38', '2025-08-26', 8),
(862, 'Get the inventory reports of Agora Showroom Main', '16:41', '2025-08-26', 8),
(863, 'Get the inventory reports of Agora Showroom Main', '16:41', '2025-08-26', 8),
(864, 'Get the inventory reports of Agora Showroom Main', '16:41', '2025-08-26', 8),
(865, 'Get the inventory reports of Agora Showroom Main', '16:41', '2025-08-26', 8),
(866, 'Get the inventory reports of Agora Showroom Main', '16:47', '2025-08-26', 8),
(867, 'Get the inventory reports of Agora Showroom Main', '16:47', '2025-08-26', 8),
(868, 'Get the inventory reports of Agora Showroom Main', '16:47', '2025-08-26', 8),
(869, 'Get the inventory reports of Agora Showroom Main', '16:47', '2025-08-26', 8),
(870, 'Get the inventory reports of Agora Showroom Main', '16:51', '2025-08-26', 8),
(871, 'Get the inventory reports of Agora Showroom Main', '17:03', '2025-08-26', 8),
(872, 'Get the inventory reports of Agora Showroom Main', '17:03', '2025-08-26', 8),
(873, 'Get the inventory reports of Agora Showroom Main', '17:09', '2025-08-26', 8),
(874, 'Get the inventory reports of Agora Showroom Main', '17:09', '2025-08-26', 8),
(875, 'Get the inventory reports of Agora Showroom Main', '17:09', '2025-08-26', 8),
(876, 'Get the inventory reports of Agora Showroom Main', '17:09', '2025-08-26', 8),
(877, 'Get the inventory reports of Agora Showroom Main', '17:12', '2025-08-26', 8),
(878, 'Get the inventory reports of Agora Showroom Main', '17:15', '2025-08-26', 8),
(879, 'Get the inventory reports of Agora Showroom Main', '17:15', '2025-08-26', 8),
(880, 'Get the inventory reports of Agora Showroom Main', '17:15', '2025-08-26', 8),
(881, 'Get the inventory reports of Agora Showroom Main', '17:15', '2025-08-26', 8),
(882, 'Get the inventory reports of Agora Showroom Main', '17:17', '2025-08-26', 8),
(883, 'Get the inventory reports of Agora Showroom Main', '17:17', '2025-08-26', 8),
(884, 'Get the inventory reports of Agora Showroom Main', '17:17', '2025-08-26', 8),
(885, 'Get the inventory reports of Agora Showroom Main', '17:18', '2025-08-26', 8),
(886, 'Get the inventory reports of Agora Showroom Main', '17:18', '2025-08-26', 8),
(887, 'Get the inventory reports of Agora Showroom Main', '17:18', '2025-08-26', 8),
(888, 'Get the inventory reports of Agora Showroom Main', '17:19', '2025-08-26', 8),
(889, 'Get the inventory reports of Agora Showroom Main', '17:19', '2025-08-26', 8),
(890, 'Get the inventory reports of Agora Showroom Main', '17:19', '2025-08-26', 8),
(891, 'Get the inventory reports of Agora Showroom Main', '17:19', '2025-08-26', 8),
(892, 'Get the inventory reports of Agora Showroom Main', '17:19', '2025-08-26', 8),
(893, 'Get the inventory reports of Agora Showroom Main', '17:19', '2025-08-26', 8),
(894, 'Get the inventory reports of Agora Showroom Main', '17:19', '2025-08-26', 8),
(895, 'Get the inventory reports of Agora Showroom Main', '17:19', '2025-08-26', 8),
(896, 'Get the inventory reports of Agora Showroom Main', '17:19', '2025-08-26', 8),
(897, 'Get the inventory reports of Agora Showroom Main', '17:19', '2025-08-26', 8),
(898, 'Get the inventory reports of Agora Showroom Main', '17:19', '2025-08-26', 8),
(899, 'Get the inventory reports of Agora Showroom Main', '17:20', '2025-08-26', 8),
(900, 'Get the inventory reports of Agora Showroom Main', '17:20', '2025-08-26', 8),
(901, 'Get the inventory reports of Agora Showroom Main', '17:20', '2025-08-26', 8),
(902, 'Get the inventory reports of Agora Showroom Main', '17:21', '2025-08-26', 8),
(903, 'Get the inventory reports of Agora Showroom Main', '17:21', '2025-08-26', 8),
(904, 'Get the inventory reports of Agora Showroom Main', '17:32', '2025-08-26', 8),
(905, 'Get the inventory reports of Agora Showroom Main', '17:32', '2025-08-26', 8),
(906, 'Get the inventory reports of Agora Showroom Main', '17:32', '2025-08-26', 8),
(907, 'Get the inventory reports of Agora Showroom Main', '17:32', '2025-08-26', 8),
(908, 'Get the inventory reports of Agora Showroom Main', '17:33', '2025-08-26', 8),
(909, 'Get the inventory reports of Agora Showroom Main', '17:33', '2025-08-26', 8),
(910, 'Get the inventory reports of Agora Showroom Main', '17:33', '2025-08-26', 8),
(911, 'Get the inventory reports of Agora Showroom Main', '17:33', '2025-08-26', 8),
(912, 'Get the inventory reports of Agora Showroom Main', '17:34', '2025-08-26', 8),
(913, 'Get the inventory reports of Agora Showroom Main', '17:34', '2025-08-26', 8),
(914, 'Get the inventory reports of Agora Showroom Main', '17:34', '2025-08-26', 8),
(915, 'Get the inventory reports of Agora Showroom Main', '17:34', '2025-08-26', 8),
(916, 'Get the inventory reports of Agora Showroom Main', '17:34', '2025-08-26', 8),
(917, 'Get the inventory reports of Agora Showroom Main', '17:34', '2025-08-26', 8),
(918, 'Get the inventory reports of Agora Showroom Main', '17:34', '2025-08-26', 8),
(919, 'Get the inventory reports of Agora Showroom Main', '17:34', '2025-08-26', 8),
(920, 'Get the inventory reports of Agora Showroom Main', '17:34', '2025-08-26', 8),
(921, 'Get the inventory reports of Agora Showroom Main', '17:34', '2025-08-26', 8),
(922, 'Get the inventory reports of Agora Showroom Main', '17:34', '2025-08-26', 8),
(923, 'Get the inventory reports of Agora Showroom Main', '17:34', '2025-08-26', 8),
(924, 'Get the inventory reports of Agora Showroom Main', '17:35', '2025-08-26', 8),
(925, 'Get the inventory reports of Agora Showroom Main', '17:35', '2025-08-26', 8),
(926, 'Get the inventory reports of Agora Showroom Main', '17:35', '2025-08-26', 8),
(927, 'Get the inventory reports of Agora Showroom Main', '17:35', '2025-08-26', 8),
(928, 'Track the request #58', '17:38', '2025-08-26', 8),
(929, 'Track the request #58', '18:01', '2025-08-26', 8),
(930, 'Get the inventory reports of Agora Showroom Main', '19:31', '2025-08-26', 8),
(931, 'Get the inventory reports of Agora Showroom Main', '19:31', '2025-08-26', 8),
(932, 'Get the inventory reports of Agora Showroom Main', '19:31', '2025-08-26', 8),
(933, 'Get the inventory reports of Agora Showroom Main', '19:31', '2025-08-26', 8),
(934, 'Get the inventory reports of Agora Showroom Main', '20:43', '2025-08-26', 8),
(935, 'Get the inventory reports of Agora Showroom Main', '20:43', '2025-08-26', 8),
(936, 'Get the inventory reports of Agora Showroom Main', '20:43', '2025-08-26', 8),
(937, 'Get the inventory reports of Agora Showroom Main', '20:43', '2025-08-26', 8),
(938, 'Get the inventory reports of Agora Showroom Main', '20:43', '2025-08-26', 8),
(939, 'Get the inventory reports of Agora Showroom Main', '20:43', '2025-08-26', 8),
(940, 'Get the inventory reports of Warehouse CDO', '20:43', '2025-08-26', 9),
(941, 'Get the inventory reports of Warehouse CDO', '20:43', '2025-08-26', 9),
(942, 'Get the inventory reports of Warehouse CDO', '20:43', '2025-08-26', 9),
(943, 'Get the inventory reports of Warehouse CDO', '20:43', '2025-08-26', 9),
(944, 'Track the request #58', '20:48', '2025-08-26', 9),
(945, 'Get the inventory reports of A.G-27 in Warehouse CDO store', '20:55', '2025-08-26', 9),
(946, 'Get the inventory reports of A.G-53 in Warehouse CDO store', '20:55', '2025-08-26', 9),
(947, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '20:56', '2025-08-26', 9),
(948, 'Get the inventory reports of A.G-53 in Warehouse CDO store', '20:56', '2025-08-26', 9),
(949, 'Get the inventory reports of A.G-27 in Warehouse CDO store', '20:56', '2025-08-26', 9),
(950, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '20:56', '2025-08-26', 9),
(951, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '20:57', '2025-08-26', 9),
(952, 'Get the inventory reports of A.G-42 in Warehouse CDO store', '20:57', '2025-08-26', 9),
(953, 'Get the inventory reports of A.G-71 in Warehouse CDO store', '20:57', '2025-08-26', 9),
(954, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '20:58', '2025-08-26', 9),
(955, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '21:01', '2025-08-26', 9),
(956, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '21:06', '2025-08-26', 9),
(957, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '21:15', '2025-08-26', 9),
(958, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '21:15', '2025-08-26', 9),
(959, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '21:16', '2025-08-26', 9),
(960, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '21:18', '2025-08-26', 9),
(961, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '21:21', '2025-08-26', 9),
(962, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '21:23', '2025-08-26', 9),
(963, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '21:24', '2025-08-26', 9),
(964, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '21:24', '2025-08-26', 9),
(965, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '23:26', '2025-08-26', 9),
(966, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '23:26', '2025-08-26', 9),
(967, 'Get the inventory reports of A.G-122 in Agora Showroom Main store', '23:27', '2025-08-26', 8),
(968, 'Get the inventory reports of A.G-119 in Agora Showroom Main store', '23:28', '2025-08-26', 8),
(969, 'Get the inventory reports of A.G-152 in Agora Showroom Main store', '23:28', '2025-08-26', 8),
(970, 'Get the inventory reports of A.G-49 in Agora Showroom Main store', '23:28', '2025-08-26', 8),
(971, 'Get the inventory reports of A.G-140 in Agora Showroom Main store', '23:28', '2025-08-26', 8),
(972, 'Get the inventory reports of A.G-1 in Agora Showroom Main store', '23:28', '2025-08-26', 8),
(973, 'Get the inventory reports of A.G-132 in Agora Showroom Main store', '23:28', '2025-08-26', 8),
(974, 'Get the inventory reports of A.G-96 in Agora Showroom Main store', '23:28', '2025-08-26', 8),
(975, 'Get the inventory reports of A.G-116 in Agora Showroom Main store', '23:28', '2025-08-26', 8),
(976, 'Get the inventory reports of A.G-103 in Agora Showroom Main store', '23:28', '2025-08-26', 8),
(977, 'Get the inventory reports of A.G-97 in Agora Showroom Main store', '23:28', '2025-08-26', 8),
(978, 'Get the inventory reports of A.G-5 in Agora Showroom Main store', '23:28', '2025-08-26', 8),
(979, 'Get the inventory reports of A.G-52 in Agora Showroom Main store', '23:28', '2025-08-26', 8),
(980, 'Get the inventory reports of Agora Showroom Main', '01:09', '2025-08-27', 8),
(981, 'Get the inventory reports of Agora Showroom Main', '01:09', '2025-08-27', 8),
(982, 'Get the inventory reports of Agora Showroom Main', '01:09', '2025-08-27', 8),
(983, 'Get the inventory reports of Agora Showroom Main', '01:09', '2025-08-27', 8),
(984, 'Get the inventory reports of Agora Showroom Main', '01:09', '2025-08-27', 8),
(985, 'Deliver the request #74', '01:10', '2025-08-27', 9),
(986, 'Deliver the request #87', '01:12', '2025-08-27', 9),
(987, 'Receive the delivery from request #87', '01:13', '2025-08-27', 8),
(988, 'Get the inventory reports of Agora Showroom Main', '01:13', '2025-08-27', 8),
(989, 'Get the inventory reports of Agora Showroom Main', '01:13', '2025-08-27', 8),
(990, 'Get the inventory reports of Agora Showroom Main', '01:13', '2025-08-27', 8),
(991, 'Get the inventory reports of Agora Showroom Main', '01:13', '2025-08-27', 8),
(992, 'Stock In A Product', '01:17', '2025-08-27', 9),
(993, 'Get the inventory reports of Warehouse CDO', '01:17', '2025-08-27', 9),
(994, 'Get the inventory reports of Warehouse CDO', '01:17', '2025-08-27', 9),
(995, 'Get the inventory reports of Warehouse CDO', '01:17', '2025-08-27', 9),
(996, 'Get the inventory reports of Warehouse CDO', '01:17', '2025-08-27', 9),
(997, 'Log In', '05:39', '2025-08-27', 12),
(998, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '14:12', '2025-08-27', 9),
(999, 'Request Stock Out List', '14:27', '2025-08-27', 8),
(1000, 'Request Stock Out List', '14:27', '2025-08-27', 8),
(1001, 'Request Stock Out List', '14:28', '2025-08-27', 8),
(1002, 'Request Stock Out List', '14:28', '2025-08-27', 8),
(1003, 'Request Stock Out List', '14:28', '2025-08-27', 8),
(1004, 'Request Stock Out List', '14:28', '2025-08-27', 8),
(1005, 'Request Stock Out List', '14:28', '2025-08-27', 8),
(1006, 'Request Stock Out List', '14:30', '2025-08-27', 8),
(1007, 'Get the inventory reports of A.G-53 in Warehouse CDO store', '14:31', '2025-08-27', 9),
(1008, 'Get the inventory reports of A.G-53 in Warehouse CDO store', '14:32', '2025-08-27', 9),
(1009, 'Get the inventory reports of A.G-71 in Warehouse CDO store', '14:32', '2025-08-27', 9),
(1010, 'Request Stock Out List', '14:34', '2025-08-27', 8),
(1011, 'Request Stock Out List', '14:36', '2025-08-27', 8),
(1012, 'Sent a request from Agora Showroom Main to Warehouse CDO', '14:46', '2025-08-27', 8),
(1013, 'Accept the request #97', '14:49', '2025-08-27', 9),
(1014, 'Track the request #97', '14:50', '2025-08-27', 8),
(1015, 'Track the request #97', '14:50', '2025-08-27', 8),
(1016, 'Track the request #97', '14:52', '2025-08-27', 8),
(1017, 'Track the request #97', '14:54', '2025-08-27', 8),
(1018, 'Deliver the request #97', '15:05', '2025-08-27', 9),
(1019, 'Track the request #97', '15:05', '2025-08-27', 8),
(1020, 'Receive the delivery from request #97', '15:10', '2025-08-27', 8),
(1021, 'Get the inventory reports of Agora Showroom Main', '15:11', '2025-08-27', 8),
(1022, 'Get the inventory reports of Agora Showroom Main', '15:11', '2025-08-27', 8),
(1023, 'Get the inventory reports of Agora Showroom Main', '15:11', '2025-08-27', 8),
(1024, 'Get the inventory reports of Agora Showroom Main', '15:11', '2025-08-27', 8),
(1025, 'Get the inventory reports of A.G-103 in Agora Showroom Main store', '15:13', '2025-08-27', 8),
(1026, 'Deliver the request #86', '20:00', '2025-08-27', 9),
(1027, 'Get the inventory reports of Agora Showroom Main', '20:00', '2025-08-27', 8),
(1028, 'Get the inventory reports of Agora Showroom Main', '20:00', '2025-08-27', 8),
(1029, 'Get the inventory reports of Agora Showroom Main', '20:00', '2025-08-27', 8),
(1030, 'Get the inventory reports of Agora Showroom Main', '20:00', '2025-08-27', 8),
(1031, 'Get the inventory reports of Agora Showroom Main', '21:21', '2025-08-27', 8),
(1032, 'Get the inventory reports of Agora Showroom Main', '21:21', '2025-08-27', 8),
(1033, 'Get the inventory reports of Agora Showroom Main', '21:21', '2025-08-27', 8),
(1034, 'Get the inventory reports of Agora Showroom Main', '21:21', '2025-08-27', 8),
(1035, 'Process a walk-in customer sale at Agora Showroom Main, Invoice#9', '21:32', '2025-08-27', 12),
(1036, 'Get the inventory reports of Agora Showroom Main', '21:34', '2025-08-27', 8),
(1037, 'Get the inventory reports of Agora Showroom Main', '21:34', '2025-08-27', 8),
(1038, 'Get the inventory reports of Agora Showroom Main', '21:34', '2025-08-27', 8),
(1039, 'Get the inventory reports of Agora Showroom Main', '21:34', '2025-08-27', 8),
(1040, 'Request Stock Out List', '01:18', '2025-08-28', 8),
(1041, 'Request Stock Out List', '01:18', '2025-08-28', 8),
(1042, 'Request Stock Out List', '01:27', '2025-08-28', 8),
(1043, 'Request Stock Out List', '01:27', '2025-08-28', 8),
(1044, 'Log In', '23:37', '2025-08-29', 7),
(1045, 'Log In', '02:29', '2025-08-30', 9),
(1046, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '03:09', '2025-08-30', 9),
(1047, 'Log In', '13:26', '2025-08-30', 12),
(1048, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '13:52', '2025-08-30', 9),
(1049, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '13:52', '2025-08-30', 9),
(1050, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '13:52', '2025-08-30', 9),
(1051, 'Get the inventory reports of A.G-27 in Warehouse CDO store', '13:53', '2025-08-30', 9),
(1052, 'Process a walk-in customer sale at Agora Showroom Main, Invoice#13', '21:51', '2025-08-30', 12),
(1053, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '21:53', '2025-08-30', 9),
(1054, 'Process a customer sale at Agora Showroom Main, Invoice#14', '00:33', '2025-08-31', 12),
(1055, 'Get the inventory reports of Warehouse CDO', '12:28', '2025-08-31', 9),
(1056, 'Get the inventory reports of Warehouse CDO', '12:28', '2025-08-31', 9),
(1057, 'Get the inventory reports of Warehouse CDO', '12:28', '2025-08-31', 9),
(1058, 'Get the inventory reports of Warehouse CDO', '12:28', '2025-08-31', 9),
(1059, 'Get the inventory reports of Warehouse CDO', '12:28', '2025-08-31', 9),
(1060, 'Get the inventory reports of Warehouse CDO', '12:28', '2025-08-31', 9),
(1061, 'Get the inventory reports of Warehouse CDO', '12:28', '2025-08-31', 9),
(1062, 'Get the inventory reports of Warehouse CDO', '12:28', '2025-08-31', 9),
(1063, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '19:27', '2025-08-31', 9),
(1064, 'Process a customer sale at Agora Showroom Main, Invoice#15', '20:04', '2025-08-31', 12),
(1065, 'Log In', '20:10', '2025-08-31', 8),
(1066, 'Get the inventory reports of Agora Showroom Main', '20:11', '2025-08-31', 8),
(1067, 'Get the inventory reports of Agora Showroom Main', '20:11', '2025-08-31', 8),
(1068, 'Get the inventory reports of Agora Showroom Main', '20:11', '2025-08-31', 8),
(1069, 'Get the inventory reports of Agora Showroom Main', '20:11', '2025-08-31', 8),
(1070, 'Get the inventory reports of Agora Showroom Main', '20:12', '2025-08-31', 8),
(1071, 'Get the inventory reports of Agora Showroom Main', '20:12', '2025-08-31', 8),
(1072, 'Get the inventory reports of Agora Showroom Main', '20:12', '2025-08-31', 8),
(1073, 'Get the inventory reports of Agora Showroom Main', '20:12', '2025-08-31', 8),
(1074, 'Process a customer sale at Agora Showroom Main, Invoice#16', '20:18', '2025-08-31', 12),
(1075, 'Process a customer sale at Agora Showroom Main, Invoice# 20', '20:26', '2025-08-31', 12),
(1076, 'Get the inventory reports of Agora Showroom Main', '20:27', '2025-08-31', 8),
(1077, 'Get the inventory reports of Agora Showroom Main', '20:27', '2025-08-31', 8),
(1078, 'Get the inventory reports of Agora Showroom Main', '20:27', '2025-08-31', 8),
(1079, 'Get the inventory reports of Agora Showroom Main', '20:27', '2025-08-31', 8),
(1080, 'Get the inventory reports of Warehouse CDO', '20:36', '2025-08-31', 9),
(1081, 'Get the inventory reports of Warehouse CDO', '20:36', '2025-08-31', 9),
(1082, 'Get the inventory reports of Warehouse CDO', '20:36', '2025-08-31', 9),
(1083, 'Get the inventory reports of Warehouse CDO', '20:36', '2025-08-31', 9),
(1084, 'Get the inventory reports of Warehouse CDO', '20:45', '2025-08-31', 9),
(1085, 'Get the inventory reports of Warehouse CDO', '20:45', '2025-08-31', 9),
(1086, 'Get the inventory reports of Warehouse CDO', '20:45', '2025-08-31', 9),
(1087, 'Get the inventory reports of Warehouse CDO', '20:45', '2025-08-31', 9),
(1088, 'Get the inventory reports of Warehouse CDO', '20:49', '2025-08-31', 9),
(1089, 'Get the inventory reports of Warehouse CDO', '20:49', '2025-08-31', 9),
(1090, 'Get the inventory reports of Warehouse CDO', '20:49', '2025-08-31', 9),
(1091, 'Get the inventory reports of Warehouse CDO', '20:49', '2025-08-31', 9),
(1092, 'Get the inventory reports of Warehouse CDO', '20:52', '2025-08-31', 9),
(1093, 'Get the inventory reports of Warehouse CDO', '20:52', '2025-08-31', 9),
(1094, 'Get the inventory reports of Warehouse CDO', '20:52', '2025-08-31', 9),
(1095, 'Get the inventory reports of Warehouse CDO', '20:52', '2025-08-31', 9),
(1096, 'Get the inventory reports of Warehouse CDO', '20:54', '2025-08-31', 9),
(1097, 'Get the inventory reports of Warehouse CDO', '20:54', '2025-08-31', 9),
(1098, 'Get the inventory reports of Warehouse CDO', '20:54', '2025-08-31', 9),
(1099, 'Get the inventory reports of Warehouse CDO', '20:54', '2025-08-31', 9),
(1100, 'Get the inventory reports of Warehouse CDO', '21:05', '2025-08-31', 9),
(1101, 'Get the inventory reports of Warehouse CDO', '21:05', '2025-08-31', 9),
(1102, 'Get the inventory reports of Warehouse CDO', '21:05', '2025-08-31', 9),
(1103, 'Get the inventory reports of Warehouse CDO', '21:05', '2025-08-31', 9),
(1104, 'Get the inventory reports of Warehouse CDO', '21:10', '2025-08-31', 9),
(1105, 'Get the inventory reports of Warehouse CDO', '21:10', '2025-08-31', 9),
(1106, 'Get the inventory reports of Warehouse CDO', '21:10', '2025-08-31', 9),
(1107, 'Get the inventory reports of Warehouse CDO', '21:10', '2025-08-31', 9),
(1108, 'Get the inventory reports of Warehouse CDO', '21:14', '2025-08-31', 9),
(1109, 'Get the inventory reports of Warehouse CDO', '21:14', '2025-08-31', 9),
(1110, 'Get the inventory reports of Warehouse CDO', '21:14', '2025-08-31', 9),
(1111, 'Get the inventory reports of Warehouse CDO', '21:14', '2025-08-31', 9),
(1112, 'Get the inventory reports of Agora Showroom Main', '21:38', '2025-08-31', 8),
(1113, 'Get the inventory reports of Agora Showroom Main', '21:38', '2025-08-31', 8),
(1114, 'Get the inventory reports of Agora Showroom Main', '21:38', '2025-08-31', 8),
(1115, 'Get the inventory reports of Agora Showroom Main', '21:38', '2025-08-31', 8),
(1116, 'Get the inventory reports of Agora Showroom Main', '21:38', '2025-08-31', 8),
(1117, 'Get the inventory reports of Agora Showroom Main', '21:38', '2025-08-31', 8),
(1118, 'Get the inventory reports of Agora Showroom Main', '21:38', '2025-08-31', 8),
(1119, 'Get the inventory reports of Agora Showroom Main', '21:38', '2025-08-31', 8),
(1120, 'Get the inventory reports of Warehouse CDO', '21:38', '2025-08-31', 9),
(1121, 'Get the inventory reports of Warehouse CDO', '21:38', '2025-08-31', 9),
(1122, 'Get the inventory reports of Warehouse CDO', '21:38', '2025-08-31', 9),
(1123, 'Get the inventory reports of Warehouse CDO', '21:38', '2025-08-31', 9),
(1124, 'Get the inventory reports of Agora Showroom Main', '21:41', '2025-08-31', 8),
(1125, 'Get the inventory reports of Agora Showroom Main', '21:41', '2025-08-31', 8),
(1126, 'Get the inventory reports of Agora Showroom Main', '21:41', '2025-08-31', 8),
(1127, 'Get the inventory reports of Agora Showroom Main', '21:41', '2025-08-31', 8),
(1128, 'Get the inventory reports of Agora Showroom Main', '21:41', '2025-08-31', 8),
(1129, 'Get the inventory reports of Agora Showroom Main', '21:43', '2025-08-31', 8),
(1130, 'Get the inventory reports of Agora Showroom Main', '21:43', '2025-08-31', 8),
(1131, 'Get the inventory reports of Agora Showroom Main', '21:43', '2025-08-31', 8),
(1132, 'Get the inventory reports of Agora Showroom Main', '21:43', '2025-08-31', 8),
(1133, 'Get the inventory reports of Agora Showroom Main', '21:43', '2025-08-31', 8),
(1134, 'Get the inventory reports of Agora Showroom Main', '21:43', '2025-08-31', 8),
(1135, 'Get the inventory reports of Agora Showroom Main', '21:43', '2025-08-31', 8),
(1136, 'Get the inventory reports of Agora Showroom Main', '21:43', '2025-08-31', 8),
(1137, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1138, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1139, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1140, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1141, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1142, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1143, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1144, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1145, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1146, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1147, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1148, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1149, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1150, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1151, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1152, 'Get the inventory reports of Agora Showroom Main', '21:50', '2025-08-31', 8),
(1153, 'Get the inventory reports of Warehouse CDO', '00:07', '2025-09-01', 9),
(1154, 'Get the inventory reports of Warehouse CDO', '00:07', '2025-09-01', 9),
(1155, 'Get the inventory reports of Warehouse CDO', '00:07', '2025-09-01', 9),
(1156, 'Get the inventory reports of Warehouse CDO', '00:07', '2025-09-01', 9),
(1157, 'Get the inventory reports of Warehouse CDO', '00:28', '2025-09-01', 9),
(1158, 'Get the inventory reports of Warehouse CDO', '00:28', '2025-09-01', 9),
(1159, 'Get the inventory reports of Warehouse CDO', '00:28', '2025-09-01', 9),
(1160, 'Get the inventory reports of Warehouse CDO', '00:28', '2025-09-01', 9),
(1161, 'Mark the request #71 to complete', '00:31', '2025-09-01', 9),
(1162, 'Get the inventory reports of Warehouse CDO', '00:31', '2025-09-01', 9),
(1163, 'Get the inventory reports of Warehouse CDO', '00:31', '2025-09-01', 9),
(1164, 'Get the inventory reports of Warehouse CDO', '00:31', '2025-09-01', 9),
(1165, 'Get the inventory reports of Warehouse CDO', '00:31', '2025-09-01', 9),
(1166, 'Get the inventory reports of Warehouse CDO', '00:39', '2025-09-01', 9),
(1167, 'Get the inventory reports of Warehouse CDO', '00:39', '2025-09-01', 9),
(1168, 'Get the inventory reports of Warehouse CDO', '00:39', '2025-09-01', 9),
(1169, 'Get the inventory reports of Warehouse CDO', '00:39', '2025-09-01', 9),
(1170, 'Get the inventory reports of Agora Showroom Main', '00:44', '2025-09-01', 8),
(1171, 'Get the inventory reports of Agora Showroom Main', '00:44', '2025-09-01', 8),
(1172, 'Get the inventory reports of Agora Showroom Main', '00:44', '2025-09-01', 8),
(1173, 'Get the inventory reports of Agora Showroom Main', '00:44', '2025-09-01', 8),
(1174, 'Request Stock Out List', '00:45', '2025-09-01', 8),
(1175, 'Get the inventory reports of Warehouse CDO', '11:36', '2025-09-01', 9),
(1176, 'Get the inventory reports of Warehouse CDO', '11:36', '2025-09-01', 9),
(1177, 'Get the inventory reports of Warehouse CDO', '11:36', '2025-09-01', 9),
(1178, 'Get the inventory reports of Warehouse CDO', '11:36', '2025-09-01', 9),
(1179, 'Get the inventory reports of Warehouse CDO', '11:38', '2025-09-01', 9),
(1180, 'Get the inventory reports of Warehouse CDO', '11:38', '2025-09-01', 9),
(1181, 'Get the inventory reports of Warehouse CDO', '11:38', '2025-09-01', 9),
(1182, 'Get the inventory reports of Warehouse CDO', '11:38', '2025-09-01', 9),
(1183, 'Get the inventory reports of Warehouse CDO', '11:38', '2025-09-01', 9),
(1184, 'Get the inventory reports of Warehouse CDO', '11:38', '2025-09-01', 9),
(1185, 'Get the inventory reports of Warehouse CDO', '11:38', '2025-09-01', 9),
(1186, 'Get the inventory reports of Warehouse CDO', '11:38', '2025-09-01', 9),
(1187, 'Log Out', '18:44', '2025-09-01', 7),
(1188, 'Log In', '18:45', '2025-09-01', 7),
(1189, 'Log Out', '18:47', '2025-09-01', 7),
(1190, 'Log In', '18:48', '2025-09-01', 7),
(1191, 'Log Out', '18:49', '2025-09-01', 7),
(1192, 'Log In', '18:49', '2025-09-01', 7),
(1193, 'Log Out', '18:52', '2025-09-01', 7),
(1194, 'Log In', '18:52', '2025-09-01', 7),
(1195, 'Log Out', '18:54', '2025-09-01', 7),
(1196, 'Log In', '18:54', '2025-09-01', 7),
(1197, 'Log Out', '18:56', '2025-09-01', 7),
(1198, 'Log In', '18:56', '2025-09-01', 7),
(1199, 'Log In', '18:59', '2025-09-01', 7),
(1200, 'Log Out', '19:00', '2025-09-01', 7),
(1201, 'Log In', '19:00', '2025-09-01', 7),
(1202, 'Log Out', '19:02', '2025-09-01', 7),
(1203, 'Log In', '19:02', '2025-09-01', 7),
(1204, 'Log Out', '19:08', '2025-09-01', 9),
(1205, 'Log In', '19:08', '2025-09-01', 9),
(1206, 'Log Out', '19:09', '2025-09-01', 9),
(1207, 'Log In', '19:09', '2025-09-01', 7),
(1208, 'Log Out', '19:10', '2025-09-01', 7),
(1209, 'Log In', '19:10', '2025-09-01', 9),
(1210, 'Log Out', '19:10', '2025-09-01', 7),
(1211, 'Log In', '19:11', '2025-09-01', 7),
(1212, 'Log Out', '19:11', '2025-09-01', 8),
(1213, 'Log In', '19:11', '2025-09-01', 8),
(1214, 'Log Out', '19:12', '2025-09-01', 12),
(1215, 'Log In', '19:12', '2025-09-01', 12),
(1216, 'Log In', '19:36', '2025-09-01', 7),
(1217, 'Get the inventory reports of Agora Showroom Main', '20:25', '2025-09-01', 8),
(1218, 'Get the inventory reports of Agora Showroom Main', '20:25', '2025-09-01', 8),
(1219, 'Get the inventory reports of Agora Showroom Main', '20:25', '2025-09-01', 8),
(1220, 'Get the inventory reports of Agora Showroom Main', '20:25', '2025-09-01', 8),
(1221, 'Get the inventory reports of null', '20:35', '2025-09-01', 7),
(1222, 'Get the inventory reports of null', '20:35', '2025-09-01', 7),
(1223, 'Get the inventory reports of null', '20:35', '2025-09-01', 7),
(1224, 'Get the inventory reports of null', '20:35', '2025-09-01', 7),
(1225, 'Get the inventory reports of null', '20:35', '2025-09-01', 7),
(1226, 'Get the inventory reports of null', '20:35', '2025-09-01', 7),
(1227, 'Get the inventory reports of null', '20:35', '2025-09-01', 7),
(1228, 'Get the inventory reports of null', '20:35', '2025-09-01', 7),
(1229, 'Get the inventory reports of null', '20:35', '2025-09-01', 7),
(1230, 'Get the inventory reports of null', '20:35', '2025-09-01', 7),
(1231, 'Get the inventory reports of null', '20:35', '2025-09-01', 7),
(1232, 'Get the inventory reports of null', '20:35', '2025-09-01', 7),
(1233, 'Get the inventory reports of Warehouse CDO', '20:35', '2025-09-01', 9),
(1234, 'Get the inventory reports of Warehouse CDO', '20:35', '2025-09-01', 9),
(1235, 'Get the inventory reports of Warehouse CDO', '20:35', '2025-09-01', 9),
(1236, 'Get the inventory reports of Warehouse CDO', '20:35', '2025-09-01', 9),
(1237, 'Get the inventory reports of Warehouse CDO', '20:36', '2025-09-01', 9),
(1238, 'Get the inventory reports of Warehouse CDO', '20:36', '2025-09-01', 9),
(1239, 'Get the inventory reports of Warehouse CDO', '20:36', '2025-09-01', 9),
(1240, 'Get the inventory reports of Warehouse CDO', '20:36', '2025-09-01', 9),
(1241, 'Log Out', '20:36', '2025-09-01', 9),
(1242, 'Log In', '20:36', '2025-09-01', 9),
(1243, 'Get the inventory reports of Warehouse CDO', '20:36', '2025-09-01', 9),
(1244, 'Get the inventory reports of Warehouse CDO', '20:36', '2025-09-01', 9),
(1245, 'Get the inventory reports of Warehouse CDO', '20:36', '2025-09-01', 9),
(1246, 'Get the inventory reports of Warehouse CDO', '20:36', '2025-09-01', 9),
(1247, 'Get the inventory reports of Warehouse CDO', '20:37', '2025-09-01', 9),
(1248, 'Get the inventory reports of Warehouse CDO', '20:37', '2025-09-01', 9),
(1249, 'Get the inventory reports of Warehouse CDO', '20:37', '2025-09-01', 9),
(1250, 'Get the inventory reports of Warehouse CDO', '20:37', '2025-09-01', 9),
(1251, 'Get the inventory reports of null', '20:38', '2025-09-01', 7),
(1252, 'Get the inventory reports of null', '20:38', '2025-09-01', 7),
(1253, 'Get the inventory reports of null', '20:38', '2025-09-01', 7),
(1254, 'Get the inventory reports of Agora Showroom Main', '20:38', '2025-09-01', 8),
(1255, 'Get the inventory reports of Agora Showroom Main', '20:38', '2025-09-01', 8),
(1256, 'Get the inventory reports of Agora Showroom Main', '20:38', '2025-09-01', 8),
(1257, 'Get the inventory reports of Agora Showroom Main', '20:38', '2025-09-01', 8),
(1258, 'Get the inventory reports of null', '20:43', '2025-09-01', 7),
(1259, 'Get the inventory reports of null', '20:43', '2025-09-01', 7),
(1260, 'Get the inventory reports of null', '20:43', '2025-09-01', 7),
(1261, 'Get the inventory reports of all locations', '20:54', '2025-09-01', 7),
(1262, 'Get the inventory reports of null', '20:54', '2025-09-01', 7),
(1263, 'Get the inventory reports of null', '20:54', '2025-09-01', 7),
(1264, 'Get the inventory reports of null', '20:55', '2025-09-01', 7),
(1265, 'Get the inventory reports of null', '20:55', '2025-09-01', 7),
(1266, 'Get the inventory reports of all locations', '20:56', '2025-09-01', 7),
(1267, 'Get the inventory reports of null', '20:56', '2025-09-01', 7),
(1268, 'Get the inventory reports of null', '20:56', '2025-09-01', 7),
(1269, 'Get the inventory reports of null', '20:57', '2025-09-01', 7),
(1270, 'Get the inventory reports of null', '20:57', '2025-09-01', 7),
(1271, 'Get the inventory reports of null', '20:57', '2025-09-01', 7),
(1272, 'Get the inventory reports of null', '20:57', '2025-09-01', 7),
(1273, 'Get the inventory reports of null', '20:57', '2025-09-01', 7),
(1274, 'Get the inventory reports of null', '20:57', '2025-09-01', 7),
(1275, 'Get the inventory reports of all locations', '21:01', '2025-09-01', 7),
(1276, 'Get the inventory reports of all locations', '21:01', '2025-09-01', 7),
(1277, 'Get the inventory reports of null', '21:01', '2025-09-01', 7),
(1278, 'Get the inventory reports of null', '21:01', '2025-09-01', 7),
(1279, 'Get the inventory reports of all locations', '21:02', '2025-09-01', 7),
(1280, 'Get the inventory reports of Agora Showroom Main', '21:02', '2025-09-01', 7),
(1281, 'Get the inventory reports of Warehouse CDO', '21:02', '2025-09-01', 7),
(1282, 'Get the inventory reports of A.G-122 in null store', '22:43', '2025-09-01', 7),
(1283, 'Get the inventory reports of all locations', '22:43', '2025-09-01', 7),
(1284, 'Get the inventory reports of A.G-122 in null store', '22:43', '2025-09-01', 7),
(1285, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '22:53', '2025-09-01', 9),
(1286, 'Get the inventory reports of A.G-53 in Warehouse CDO store', '22:53', '2025-09-01', 9),
(1287, 'Get the inventory reports of A.G-122 in null store', '22:55', '2025-09-01', 7),
(1288, 'Get the inventory reports of all locations', '23:03', '2025-09-01', 7),
(1289, 'Get the inventory reports of all locations', '23:03', '2025-09-01', 7),
(1290, 'Get the inventory reports of all locations', '23:05', '2025-09-01', 7),
(1291, 'Get the inventory reports of A.G-122 in null store', '23:09', '2025-09-01', 7),
(1292, 'Get the inventory reports of A.G-122 in null store', '23:10', '2025-09-01', 7),
(1293, 'Log Out', '23:15', '2025-09-01', 7),
(1294, 'Log In', '23:16', '2025-09-01', 7),
(1295, 'Get the inventory reports of A.G-122 in null store', '23:19', '2025-09-01', 7),
(1296, 'Get the inventory reports of null', '23:21', '2025-09-01', 7),
(1297, 'Get the inventory reports of null', '23:21', '2025-09-01', 7),
(1298, 'Get the inventory reports of null', '23:21', '2025-09-01', 7),
(1299, 'Get the inventory reports of A.G-122 in null store', '23:26', '2025-09-01', 7),
(1300, 'Get the inventory reports of all locations', '23:26', '2025-09-01', 7),
(1301, 'Get the inventory reports of all locations', '23:28', '2025-09-01', 7),
(1302, 'Get the inventory reports of A.G-27 in null store', '23:28', '2025-09-01', 7),
(1303, 'Get the inventory reports of all locations', '23:36', '2025-09-01', 7),
(1304, 'Get the inventory reports of null', '00:22', '2025-09-02', 7),
(1305, 'Get the inventory reports of null', '00:22', '2025-09-02', 7),
(1306, 'Get the inventory reports of null', '00:22', '2025-09-02', 7),
(1307, 'Get the inventory reports of null', '00:24', '2025-09-02', 7),
(1308, 'Get the inventory reports of null', '00:24', '2025-09-02', 7),
(1309, 'Get the inventory reports of null', '00:24', '2025-09-02', 7),
(1310, 'Get the inventory reports of null', '00:25', '2025-09-02', 7),
(1311, 'Get the inventory reports of null', '00:25', '2025-09-02', 7),
(1312, 'Get the inventory reports of null', '00:25', '2025-09-02', 7),
(1313, 'Get the inventory reports of all locations', '00:25', '2025-09-02', 7),
(1314, 'Log Out', '00:56', '2025-09-02', 12),
(1315, 'Log Out', '00:56', '2025-09-02', 9),
(1316, 'Log Out', '00:56', '2025-09-02', 7),
(1317, 'Log Out', '00:56', '2025-09-02', 8),
(1318, 'Log In', '07:28', '2025-09-02', 7),
(1319, 'Log In', '07:29', '2025-09-02', 9),
(1320, 'Log In', '07:29', '2025-09-02', 7),
(1321, 'Log Out', '07:29', '2025-09-02', 7),
(1322, 'Get the inventory reports of null', '07:32', '2025-09-02', 7),
(1323, 'Get the inventory reports of null', '07:32', '2025-09-02', 7),
(1324, 'Get the inventory reports of null', '07:32', '2025-09-02', 7),
(1325, 'Get the inventory reports of null', '07:49', '2025-09-02', 7),
(1326, 'Get the inventory reports of null', '07:49', '2025-09-02', 7),
(1327, 'Get the inventory reports of null', '07:49', '2025-09-02', 7),
(1328, 'Get the inventory reports of all locations', '07:49', '2025-09-02', 7),
(1329, 'Get the inventory reports of A.G-122 in null store', '07:49', '2025-09-02', 7),
(1330, 'Log In', '07:57', '2025-09-02', 12),
(1331, 'Log In', '07:57', '2025-09-02', 12),
(1332, 'Processed a customer sale at Agora Showroom Main, Invoice #21', '08:07', '2025-09-02', 12),
(1333, 'Get the inventory reports of null', '08:10', '2025-09-02', 7),
(1334, 'Get the inventory reports of null', '08:10', '2025-09-02', 7),
(1335, 'Get the inventory reports of null', '08:10', '2025-09-02', 7),
(1336, 'Processed a walk-in customer sale at Agora Showroom Main, Invoice #22', '08:15', '2025-09-02', 12),
(1337, 'Processed a walk-in customer sale at Agora Showroom Main, Invoice #23', '08:24', '2025-09-02', 12),
(1338, 'Get the inventory reports of all locations', '12:00', '2025-09-02', 7),
(1339, 'Log In', '12:11', '2025-09-02', 7),
(1340, 'Log In', '12:11', '2025-09-02', 7),
(1341, 'Log In', '12:12', '2025-09-02', 7),
(1342, 'Get the inventory reports of null', '12:13', '2025-09-02', 7),
(1343, 'Get the inventory reports of null', '12:13', '2025-09-02', 7),
(1344, 'Get the inventory reports of null', '12:13', '2025-09-02', 7),
(1345, 'Log In', '12:14', '2025-09-02', 9),
(1346, 'Accept the request #89', '12:15', '2025-09-02', 9),
(1347, 'Accept the request #95', '12:15', '2025-09-02', 9),
(1348, 'Log In', '12:22', '2025-09-02', 7),
(1349, 'Log Out', '12:25', '2025-09-02', 7),
(1350, 'Log In', '12:25', '2025-09-02', 8),
(1351, 'Deliver the request #84', '12:26', '2025-09-02', 9),
(1352, 'Request Stock Out List', '12:26', '2025-09-02', 8),
(1353, 'Request Stock Out List', '12:26', '2025-09-02', 8),
(1354, 'Deliver the request #85', '12:27', '2025-09-02', 9),
(1355, 'Sent a request from Jasaan Showroom to Warehouse CDO', '12:27', '2025-09-02', 8),
(1356, 'Log In', '12:28', '2025-09-02', 7),
(1357, 'Accept the request #98', '12:28', '2025-09-02', 9),
(1358, 'Log Out', '12:29', '2025-09-02', 8),
(1359, 'Log In', '12:29', '2025-09-02', 17),
(1360, 'Deliver the request #98', '12:30', '2025-09-02', 9),
(1361, 'Sent a request from Jasaan Showroom to Warehouse CDO', '12:31', '2025-09-02', 17),
(1362, 'Accept the request #99', '12:32', '2025-09-02', 9),
(1363, 'Deliver the request #99', '12:33', '2025-09-02', 9),
(1364, 'Track the request #99', '12:33', '2025-09-02', 17),
(1365, 'Receive the delivery from request #99', '12:36', '2025-09-02', 17),
(1366, 'Get the inventory reports of Jasaan Showroom', '12:36', '2025-09-02', 17),
(1367, 'Get the inventory reports of Jasaan Showroom', '12:36', '2025-09-02', 17),
(1368, 'Get the inventory reports of Jasaan Showroom', '12:36', '2025-09-02', 17),
(1369, 'Get the inventory reports of Jasaan Showroom', '12:36', '2025-09-02', 17),
(1370, 'Get the inventory reports of Jasaan Showroom', '12:36', '2025-09-02', 17),
(1371, 'Mark the request #99 to complete', '12:38', '2025-09-02', 9),
(1372, 'Get the inventory reports of A.G-96 in Warehouse CDO store', '12:38', '2025-09-02', 9),
(1373, 'Get the inventory reports of Jasaan Showroom', '12:38', '2025-09-02', 17),
(1374, 'Get the inventory reports of Jasaan Showroom', '12:39', '2025-09-02', 17),
(1375, 'Get the inventory reports of Jasaan Showroom', '12:39', '2025-09-02', 17),
(1376, 'Get the inventory reports of Jasaan Showroom', '12:39', '2025-09-02', 17),
(1377, 'Get the inventory reports of Jasaan Showroom', '12:39', '2025-09-02', 17),
(1378, 'Get the inventory reports of Jasaan Showroom', '12:39', '2025-09-02', 17),
(1379, 'Get the inventory reports of Jasaan Showroom', '12:40', '2025-09-02', 17),
(1380, 'Get the inventory reports of Jasaan Showroom', '12:40', '2025-09-02', 17),
(1381, 'Get the inventory reports of Jasaan Showroom', '12:40', '2025-09-02', 17),
(1382, 'Get the inventory reports of Jasaan Showroom', '12:40', '2025-09-02', 17),
(1383, 'Get the inventory reports of Jasaan Showroom', '12:40', '2025-09-02', 17),
(1384, 'Get the inventory reports of Jasaan Showroom', '12:40', '2025-09-02', 17),
(1385, 'Get the inventory reports of Jasaan Showroom', '12:40', '2025-09-02', 17),
(1386, 'Get the inventory reports of Jasaan Showroom', '12:40', '2025-09-02', 17),
(1387, 'Get the inventory reports of Jasaan Showroom', '12:40', '2025-09-02', 17),
(1388, 'Get the inventory reports of Jasaan Showroom', '12:40', '2025-09-02', 17),
(1389, 'Get the inventory reports of A.G-141 in Warehouse CDO store', '12:40', '2025-09-02', 9),
(1390, 'Get the inventory reports of Jasaan Showroom', '12:41', '2025-09-02', 17),
(1391, 'Get the inventory reports of Jasaan Showroom', '12:41', '2025-09-02', 17),
(1392, 'Get the inventory reports of Jasaan Showroom', '12:41', '2025-09-02', 17),
(1393, 'Get the inventory reports of Jasaan Showroom', '12:41', '2025-09-02', 17),
(1394, 'Get the inventory reports of Warehouse CDO', '12:41', '2025-09-02', 9),
(1395, 'Get the inventory reports of Warehouse CDO', '12:41', '2025-09-02', 9),
(1396, 'Get the inventory reports of Warehouse CDO', '12:41', '2025-09-02', 9),
(1397, 'Get the inventory reports of Warehouse CDO', '12:41', '2025-09-02', 9),
(1398, 'Stock In A Product', '12:44', '2025-09-02', 9),
(1399, 'Get the inventory reports of Warehouse CDO', '12:44', '2025-09-02', 9),
(1400, 'Get the inventory reports of Warehouse CDO', '12:44', '2025-09-02', 9),
(1401, 'Get the inventory reports of Warehouse CDO', '12:44', '2025-09-02', 9),
(1402, 'Get the inventory reports of Warehouse CDO', '12:44', '2025-09-02', 9),
(1403, 'Log Out', '12:44', '2025-09-02', 17),
(1404, 'Log Out', '12:46', '2025-09-02', 9),
(1405, 'Log In', '12:46', '2025-09-02', 12),
(1406, 'Get the inventory reports of null', '12:49', '2025-09-02', 7),
(1407, 'Get the inventory reports of null', '12:49', '2025-09-02', 7),
(1408, 'Get the inventory reports of null', '12:49', '2025-09-02', 7),
(1409, 'Processed a walk-in customer sale at Agora Showroom Main, Invoice #24', '12:49', '2025-09-02', 12),
(1410, 'Get the inventory reports of A.G-122 in null store', '13:02', '2025-09-02', 7),
(1411, 'Get the inventory reports of A.G-122 in null store', '13:02', '2025-09-02', 7),
(1412, 'Get the inventory reports of A.G-96 in null store', '13:02', '2025-09-02', 7),
(1413, 'Get the inventory reports of all locations', '13:02', '2025-09-02', 7),
(1414, 'Log In', '13:07', '2025-09-02', 9),
(1415, 'Get the inventory reports of Warehouse CDO', '13:08', '2025-09-02', 9),
(1416, 'Get the inventory reports of Warehouse CDO', '13:08', '2025-09-02', 9),
(1417, 'Get the inventory reports of Warehouse CDO', '13:08', '2025-09-02', 9),
(1418, 'Get the inventory reports of Warehouse CDO', '13:08', '2025-09-02', 9),
(1419, 'Stock In A Product', '13:12', '2025-09-02', 9),
(1420, 'Get the inventory reports of Warehouse CDO', '13:12', '2025-09-02', 9),
(1421, 'Get the inventory reports of Warehouse CDO', '13:12', '2025-09-02', 9),
(1422, 'Get the inventory reports of Warehouse CDO', '13:12', '2025-09-02', 9),
(1423, 'Get the inventory reports of Warehouse CDO', '13:12', '2025-09-02', 9),
(1424, 'Deliver the request #93', '13:14', '2025-09-02', 9),
(1425, 'Stock In A Product', '13:15', '2025-09-02', 9),
(1426, 'Get the inventory reports of Warehouse CDO', '13:15', '2025-09-02', 9),
(1427, 'Get the inventory reports of Warehouse CDO', '13:15', '2025-09-02', 9),
(1428, 'Get the inventory reports of Warehouse CDO', '13:15', '2025-09-02', 9),
(1429, 'Get the inventory reports of Warehouse CDO', '13:15', '2025-09-02', 9);
INSERT INTO `activity_log` (`activity_log_id`, `activity`, `time`, `date`, `account_id`) VALUES
(1430, 'Get the inventory reports of Warehouse CDO', '13:18', '2025-09-02', 9),
(1431, 'Get the inventory reports of Warehouse CDO', '13:18', '2025-09-02', 9),
(1432, 'Get the inventory reports of Warehouse CDO', '13:18', '2025-09-02', 9),
(1433, 'Get the inventory reports of Warehouse CDO', '13:18', '2025-09-02', 9),
(1434, 'Log In', '13:19', '2025-09-02', 8),
(1435, 'Log Out', '13:20', '2025-09-02', 12),
(1436, 'Log In', '13:21', '2025-09-02', 17),
(1437, 'Sent a request from Agora Showroom Main to Warehouse CDO', '13:22', '2025-09-02', 17),
(1438, 'Get the inventory reports of Agora Showroom Main', '13:23', '2025-09-02', 8),
(1439, 'Get the inventory reports of Agora Showroom Main', '13:23', '2025-09-02', 8),
(1440, 'Get the inventory reports of Agora Showroom Main', '13:23', '2025-09-02', 8),
(1441, 'Get the inventory reports of Agora Showroom Main', '13:23', '2025-09-02', 8),
(1442, 'Log Out', '13:34', '2025-09-02', 8),
(1443, 'Log In', '13:39', '2025-09-02', 8),
(1444, 'Log Out', '13:42', '2025-09-02', 8),
(1445, 'Log Out', '13:43', '2025-09-02', 7),
(1446, 'Log In', '13:43', '2025-09-02', 7),
(1447, 'Log Out', '13:44', '2025-09-02', 7),
(1448, 'Log Out', '13:44', '2025-09-02', 17),
(1449, 'Log Out', '13:44', '2025-09-02', 9),
(1450, 'Log In', '13:44', '2025-09-02', 17),
(1451, 'Log Out', '13:45', '2025-09-02', 7),
(1452, 'Log In', '13:45', '2025-09-02', 7),
(1453, 'Log Out', '13:46', '2025-09-02', 17),
(1454, 'Get the inventory reports of null', '13:46', '2025-09-02', 7),
(1455, 'Get the inventory reports of null', '13:46', '2025-09-02', 7),
(1456, 'Get the inventory reports of null', '13:46', '2025-09-02', 7),
(1457, 'Log In', '13:47', '2025-09-02', 17),
(1458, 'Log Out', '13:47', '2025-09-02', 17),
(1459, 'Log In', '13:51', '2025-09-02', 7),
(1460, 'Log In', '13:52', '2025-09-02', 7),
(1461, 'Log Out', '13:52', '2025-09-02', 7),
(1462, 'Log In', '13:53', '2025-09-02', 7),
(1463, 'Log Out', '13:54', '2025-09-02', 7),
(1464, 'Log In', '13:55', '2025-09-02', 7),
(1465, 'Log In', '13:57', '2025-09-02', 17),
(1466, 'Log In', '13:58', '2025-09-02', 8),
(1467, 'Log In', '13:59', '2025-09-02', 9),
(1468, 'Log Out', '14:01', '2025-09-02', 17),
(1469, 'Online', '14:02', '2025-09-02', 17),
(1470, 'Attempting to duplicate online', '14:02', '2025-09-02', 17),
(1471, 'Get the inventory reports of Jasaan Showroom', '14:03', '2025-09-02', 17),
(1472, 'Get the inventory reports of Jasaan Showroom', '14:03', '2025-09-02', 17),
(1473, 'Get the inventory reports of Jasaan Showroom', '14:03', '2025-09-02', 17),
(1474, 'Get the inventory reports of Jasaan Showroom', '14:03', '2025-09-02', 17),
(1475, 'Get the inventory reports of Jasaan Showroom', '14:03', '2025-09-02', 17),
(1476, 'Get the inventory reports of Jasaan Showroom', '14:03', '2025-09-02', 17),
(1477, 'Get the inventory reports of Jasaan Showroom', '14:03', '2025-09-02', 17),
(1478, 'Get the inventory reports of Jasaan Showroom', '14:03', '2025-09-02', 17),
(1479, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1480, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1481, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1482, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1483, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1484, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1485, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1486, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1487, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1488, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1489, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1490, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1491, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1492, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1493, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1494, 'Get the inventory reports of Warehouse CDO', '14:04', '2025-09-02', 9),
(1495, 'Get the inventory reports of Agora Showroom Main', '14:06', '2025-09-02', 8),
(1496, 'Get the inventory reports of Agora Showroom Main', '14:06', '2025-09-02', 8),
(1497, 'Get the inventory reports of Agora Showroom Main', '14:06', '2025-09-02', 8),
(1498, 'Get the inventory reports of Agora Showroom Main', '14:06', '2025-09-02', 8),
(1499, 'Get the inventory reports of Agora Showroom Main', '14:06', '2025-09-02', 8),
(1500, 'Get the inventory reports of Agora Showroom Main', '14:06', '2025-09-02', 8),
(1501, 'Get the inventory reports of Agora Showroom Main', '14:06', '2025-09-02', 8),
(1502, 'Get the inventory reports of Agora Showroom Main', '14:06', '2025-09-02', 8),
(1503, 'Get the inventory reports of Jasaan Showroom', '14:06', '2025-09-02', 17),
(1504, 'Get the inventory reports of Jasaan Showroom', '14:06', '2025-09-02', 17),
(1505, 'Get the inventory reports of Jasaan Showroom', '14:06', '2025-09-02', 17),
(1506, 'Get the inventory reports of Jasaan Showroom', '14:06', '2025-09-02', 17),
(1507, 'Online', '14:32', '2025-09-02', 12),
(1508, 'Processed a customer sale at Agora Showroom Main, Invoice #25', '14:32', '2025-09-02', 12),
(1509, 'Processed a walk-in customer sale at Agora Showroom Main, Invoice #26', '14:34', '2025-09-02', 12),
(1510, 'Attempting to duplicate online', '14:50', '2025-09-02', 12),
(1511, 'Processed a customer sale at Agora Showroom Main, Invoice #27', '17:58', '2025-09-02', 12),
(1512, 'Attempting to duplicate online', '18:02', '2025-09-02', 12),
(1513, 'Attempting to duplicate online', '19:03', '2025-09-02', 7),
(1514, 'Online', '19:04', '2025-09-02', 7),
(1515, 'Online', '19:04', '2025-09-02', 7),
(1516, 'Online', '19:05', '2025-09-02', 7),
(1517, 'Log Out (Tab Closed)', '19:11', '2025-09-02', 7),
(1518, 'Log Out (Tab Closed)', '19:11', '2025-09-02', 7),
(1519, 'Log Out (Tab Closed)', '19:11', '2025-09-02', 7),
(1520, 'Log Out (Tab Closed)', '19:11', '2025-09-02', 7),
(1521, 'Log Out (Tab Closed)', '19:12', '2025-09-02', 7),
(1522, 'Log Out (Tab Closed)', '19:12', '2025-09-02', 7),
(1523, 'Log Out (Tab Closed)', '19:12', '2025-09-02', 7),
(1524, 'Log Out (Tab Closed)', '19:12', '2025-09-02', 7),
(1525, 'Log Out (Tab Closed)', '19:13', '2025-09-02', 7),
(1526, 'Log Out (Tab Closed)', '19:13', '2025-09-02', 7),
(1527, 'Log Out (Tab Closed)', '19:13', '2025-09-02', 7),
(1528, 'Log Out (Tab Closed)', '19:13', '2025-09-02', 7),
(1529, 'Log Out (Tab Closed)', '19:13', '2025-09-02', 7),
(1530, 'Log Out (Tab Closed)', '19:14', '2025-09-02', 7),
(1531, 'Online', '19:14', '2025-09-02', 7),
(1532, 'Log Out (Tab Closed)', '19:14', '2025-09-02', 7),
(1533, 'Log Out (Tab Closed)', '19:14', '2025-09-02', 7),
(1534, 'Log Out (Tab Closed)', '19:15', '2025-09-02', 7),
(1535, 'Log Out (Tab Closed)', '19:15', '2025-09-02', 7),
(1536, 'Log Out (Tab Closed)', '19:15', '2025-09-02', 7),
(1537, 'Online', '19:16', '2025-09-02', 8),
(1538, 'Log Out (Tab Closed)', '19:16', '2025-09-02', 7),
(1539, 'Online', '19:16', '2025-09-02', 9),
(1540, 'Log Out (Tab Closed)', '19:16', '2025-09-02', 9),
(1541, 'Log Out (Tab Closed)', '19:16', '2025-09-02', 9),
(1542, 'Log Out (Tab Closed)', '19:17', '2025-09-02', 7),
(1543, 'Log Out (Tab Closed)', '19:17', '2025-09-02', 7),
(1544, 'Online', '19:17', '2025-09-02', 8),
(1545, 'Log Out (Tab Closed)', '19:17', '2025-09-02', 8),
(1546, 'Log Out (Tab Closed)', '19:17', '2025-09-02', 8),
(1547, 'Log Out (Tab Closed)', '19:18', '2025-09-02', 7),
(1548, 'Get the inventory reports of null', '19:25', '2025-09-02', 7),
(1549, 'Get the inventory reports of null', '19:25', '2025-09-02', 7),
(1550, 'Get the inventory reports of null', '19:25', '2025-09-02', 7),
(1551, 'Online', '10:15', '2025-09-03', 12),
(1552, 'Processed a walk-in customer sale at Agora Showroom Main, Invoice #28', '10:16', '2025-09-03', 12),
(1553, 'Get the inventory reports of all locations', '10:19', '2025-09-03', 7),
(1554, 'Get the inventory reports of Agora Showroom Main', '10:19', '2025-09-03', 7),
(1555, 'Processed a customer sale at Agora Showroom Main, Invoice #29', '10:20', '2025-09-03', 12),
(1556, 'Processed a walk-in customer sale at Agora Showroom Main, Invoice #30', '10:42', '2025-09-03', 12),
(1557, 'Processed a walk-in customer sale at Agora Showroom Main, Invoice #31', '10:45', '2025-09-03', 12),
(1558, 'Processed a walk-in customer sale at Agora Showroom Main, Invoice #33', '11:35', '2025-09-03', 12),
(1559, 'Online', '11:50', '2025-09-03', 8),
(1560, 'Track the request #58', '12:05', '2025-09-03', 8),
(1561, 'Track the request #84', '12:49', '2025-09-03', 8),
(1562, 'Log Out', '12:49', '2025-09-03', 7),
(1563, 'Log Out', '12:49', '2025-09-03', 12),
(1564, 'Log Out', '12:50', '2025-09-03', 8),
(1565, 'Online', '12:52', '2025-09-03', 9),
(1566, 'Get the inventory reports of Warehouse CDO', '12:53', '2025-09-03', 9),
(1567, 'Get the inventory reports of Warehouse CDO', '12:53', '2025-09-03', 9),
(1568, 'Get the inventory reports of Warehouse CDO', '12:53', '2025-09-03', 9),
(1569, 'Get the inventory reports of Warehouse CDO', '12:53', '2025-09-03', 9),
(1570, 'Get the inventory reports of Warehouse CDO', '12:57', '2025-09-03', 9),
(1571, 'Get the inventory reports of Warehouse CDO', '12:57', '2025-09-03', 9),
(1572, 'Get the inventory reports of Warehouse CDO', '12:57', '2025-09-03', 9),
(1573, 'Get the inventory reports of Warehouse CDO', '12:57', '2025-09-03', 9),
(1574, 'Online', '13:15', '2025-09-03', 17),
(1575, 'Online', '13:15', '2025-09-03', 17),
(1576, 'Online', '13:15', '2025-09-03', 17),
(1577, 'Online', '13:15', '2025-09-03', 17),
(1578, 'Online', '13:15', '2025-09-03', 17),
(1579, 'Online', '13:15', '2025-09-03', 17),
(1580, 'Online', '13:15', '2025-09-03', 17),
(1581, 'Log Out', '13:15', '2025-09-03', 17),
(1582, 'Online', '13:18', '2025-09-03', 17),
(1583, 'Online', '13:22', '2025-09-03', 7),
(1584, 'Online', '13:24', '2025-09-03', 12),
(1585, 'Get the inventory reports of null', '13:27', '2025-09-03', 7),
(1586, 'Get the inventory reports of null', '13:27', '2025-09-03', 7),
(1587, 'Get the inventory reports of null', '13:27', '2025-09-03', 7),
(1588, 'Get the inventory reports of A.G-122 in null store', '13:27', '2025-09-03', 7),
(1589, 'Get the inventory reports of A.G-122 in null store', '13:27', '2025-09-03', 7),
(1590, 'Get the inventory reports of null', '13:30', '2025-09-03', 7),
(1591, 'Get the inventory reports of null', '13:30', '2025-09-03', 7),
(1592, 'Get the inventory reports of null', '13:30', '2025-09-03', 7),
(1593, 'Get the inventory reports of null', '13:30', '2025-09-03', 7),
(1594, 'Get the inventory reports of null', '13:30', '2025-09-03', 7),
(1595, 'Get the inventory reports of null', '13:30', '2025-09-03', 7),
(1596, 'Get the inventory reports of null', '13:30', '2025-09-03', 7),
(1597, 'Get the inventory reports of A.G-122 in null store', '13:52', '2025-09-03', 7),
(1598, 'Get the inventory reports of A.G-122 in null store', '13:52', '2025-09-03', 7),
(1599, 'Get the inventory reports of all locations', '13:53', '2025-09-03', 7),
(1600, 'Log Out', '13:53', '2025-09-03', 17),
(1601, 'Online', '13:54', '2025-09-03', 17),
(1602, 'Log Out', '13:54', '2025-09-03', 17),
(1603, 'Online', '13:54', '2025-09-03', 17),
(1604, 'Online', '13:55', '2025-09-03', 17),
(1605, 'Online', '14:03', '2025-09-03', 17),
(1606, 'Log Out', '14:03', '2025-09-03', 17),
(1607, 'Online', '14:03', '2025-09-03', 7),
(1608, 'Log Out', '14:04', '2025-09-03', 7),
(1609, 'Online', '14:04', '2025-09-03', 17),
(1610, 'Online', '14:05', '2025-09-03', 17),
(1611, 'Online', '14:06', '2025-09-03', 7),
(1612, 'Log Out', '14:06', '2025-09-03', 7),
(1613, 'Online', '14:09', '2025-09-03', 17),
(1614, 'Online', '14:10', '2025-09-03', 9),
(1615, 'Accept the request #100', '14:10', '2025-09-03', 9),
(1616, 'Log Out', '14:11', '2025-09-03', 9),
(1617, 'Get the inventory reports of Jasaan Showroom', '14:11', '2025-09-03', 17),
(1618, 'Get the inventory reports of Jasaan Showroom', '14:11', '2025-09-03', 17),
(1619, 'Get the inventory reports of Jasaan Showroom', '14:11', '2025-09-03', 17),
(1620, 'Get the inventory reports of Jasaan Showroom', '14:11', '2025-09-03', 17),
(1621, 'Online', '14:11', '2025-09-03', 12),
(1622, 'Online', '14:41', '2025-09-03', 12),
(1623, 'Processed a customer sale at Agora Showroom Main, Invoice #34', '14:41', '2025-09-03', 12),
(1624, 'Online', '21:43', '2025-09-03', 12),
(1625, 'Processed a customer sale at Agora Showroom Main, Invoice #35', '21:43', '2025-09-03', 12),
(1626, 'Processed a customer sale at Agora Showroom Main, Invoice #36', '22:02', '2025-09-03', 12),
(1627, 'Online', '22:03', '2025-09-03', 7),
(1628, 'Processed a walk-in customer sale at Agora Showroom Main, Invoice #37', '22:04', '2025-09-03', 12),
(1629, 'Processed a customer sale at Agora Showroom Main, Invoice #38', '22:14', '2025-09-03', 12),
(1630, 'Get the inventory reports of all locations', '01:07', '2025-09-04', 7),
(1631, 'Get the inventory reports of A.G-122 in null store', '02:51', '2025-09-04', 7),
(1632, 'Get the inventory reports of A.G-53 in null store', '02:51', '2025-09-04', 7),
(1633, 'Get the inventory reports of A.G-141 in null store', '02:51', '2025-09-04', 7),
(1634, 'Get the inventory reports of A.G-27 in null store', '02:51', '2025-09-04', 7),
(1635, 'Get the inventory reports of A.G-53 in null store', '02:51', '2025-09-04', 7),
(1636, 'Processed a customer sale at Agora Showroom Main, Invoice #39', '02:51', '2025-09-04', 12),
(1637, 'Get the inventory reports of all locations', '02:52', '2025-09-04', 7),
(1638, 'Get the inventory reports of all locations', '02:52', '2025-09-04', 7),
(1639, 'Get the inventory reports of A.G-53 in null store', '02:52', '2025-09-04', 7),
(1640, 'Processed a walk-in customer sale at Agora Showroom Main, Invoice #40', '03:17', '2025-09-04', 12),
(1641, 'Log Out', '03:41', '2025-09-04', 12),
(1642, 'Log Out', '03:41', '2025-09-04', 7),
(1643, 'Online', '10:39', '2025-09-04', 12),
(1644, 'Online', '01:00', '2025-09-05', 12),
(1645, 'Processed a installment sale at Agora Showroom Main, Invoice #43', '14:42', '2025-09-05', 12),
(1646, 'Online', '14:57', '2025-09-05', 7),
(1647, 'Processed a installment sale at Agora Showroom Main, Invoice #44', '15:15', '2025-09-05', 12),
(1648, 'Processed a installment sale at Agora Showroom Main, Invoice #45', '15:26', '2025-09-05', 12),
(1649, 'Processed a installment sale at Agora Showroom Main, Invoice #46', '15:40', '2025-09-05', 12),
(1650, 'Processed a installment sale at Agora Showroom Main, Invoice #47', '23:41', '2025-09-05', 12),
(1651, 'Processed an installment sale at Agora Showroom Main, Invoice #48', '23:53', '2025-09-05', 12),
(1652, 'Processed an installment sale at Agora Showroom Main, Invoice #49', '00:01', '2025-09-06', 12),
(1653, 'Get the inventory reports of Agora Showroom Main', '01:14', '2025-09-07', 12),
(1654, 'Get the inventory reports of Agora Showroom Main', '01:14', '2025-09-07', 12),
(1655, 'Get the inventory reports of Agora Showroom Main', '01:14', '2025-09-07', 12),
(1656, 'Processed an installment sale at Agora Showroom Main, Invoice #50', '01:14', '2025-09-07', 12),
(1657, 'Get the inventory reports of all locations', '01:15', '2025-09-07', 7),
(1658, 'Get the inventory reports of Agora Showroom Main', '01:15', '2025-09-07', 7),
(1659, 'Get the inventory reports of Agora Showroom Main', '01:57', '2025-09-07', 12),
(1660, 'Get the inventory reports of Agora Showroom Main', '01:57', '2025-09-07', 12),
(1661, 'Get the inventory reports of Agora Showroom Main', '01:57', '2025-09-07', 12),
(1662, 'Get the inventory reports of Agora Showroom Main', '01:59', '2025-09-07', 12),
(1663, 'Get the inventory reports of Agora Showroom Main', '01:59', '2025-09-07', 12),
(1664, 'Get the inventory reports of Agora Showroom Main', '01:59', '2025-09-07', 12),
(1665, 'Viewed installment management for Agora Showroom Main', '02:13', '2025-09-07', 12),
(1666, 'Online', '02:13', '2025-09-07', 12),
(1667, 'Viewed installment management for Agora Showroom Main', '02:13', '2025-09-07', 12),
(1668, 'Viewed installment management for Agora Showroom Main', '02:13', '2025-09-07', 12),
(1669, 'Viewed installment management for Agora Showroom Main', '02:15', '2025-09-07', 12),
(1670, 'Viewed installment management for Agora Showroom Main', '02:15', '2025-09-07', 12),
(1671, 'Viewed installment management for Agora Showroom Main', '02:16', '2025-09-07', 12),
(1672, 'Viewed installment management for Agora Showroom Main', '02:16', '2025-09-07', 12),
(1673, 'Viewed installment management for Agora Showroom Main', '12:19', '2025-09-07', 12),
(1674, 'Viewed installment management for Agora Showroom Main', '12:19', '2025-09-07', 12),
(1675, 'Viewed installment management for Agora Showroom Main', '10:51', '2025-09-08', 12),
(1676, 'Viewed installment management for Agora Showroom Main', '10:51', '2025-09-08', 12),
(1677, 'Viewed installment management for Agora Showroom Main', '10:52', '2025-09-08', 12),
(1678, 'Viewed installment management for Agora Showroom Main', '10:52', '2025-09-08', 12),
(1679, 'Viewed installment management for Agora Showroom Main', '10:52', '2025-09-08', 12),
(1680, 'Viewed installment management for Agora Showroom Main', '10:52', '2025-09-08', 12),
(1681, 'Get the inventory reports of all locations', '10:53', '2025-09-08', 7),
(1682, 'Viewed installment management for Agora Showroom Main', '12:29', '2025-09-08', 12),
(1683, 'Viewed installment management for Agora Showroom Main', '12:29', '2025-09-08', 12),
(1684, 'Viewed installment management for Agora Showroom Main', '12:29', '2025-09-08', 12),
(1685, 'Viewed installment management for Agora Showroom Main', '12:29', '2025-09-08', 12),
(1686, 'Viewed installment management for Agora Showroom Main', '12:30', '2025-09-08', 12),
(1687, 'Viewed installment management for Agora Showroom Main', '12:30', '2025-09-08', 12),
(1688, 'Viewed installment management for Agora Showroom Main', '12:30', '2025-09-08', 12),
(1689, 'Viewed installment management for Agora Showroom Main', '12:30', '2025-09-08', 12),
(1690, 'Log Out', '20:32', '2025-09-08', 7),
(1691, 'Log Out', '20:32', '2025-09-08', 12),
(1692, 'Online', '19:58', '2025-09-09', 7),
(1693, 'Online', '19:59', '2025-09-09', 12),
(1694, 'Viewed installment management for Agora Showroom Main', '19:59', '2025-09-09', 12),
(1695, 'Viewed installment management for Agora Showroom Main', '19:59', '2025-09-09', 12),
(1696, 'Viewed installment management for Agora Showroom Main', '20:08', '2025-09-09', 12),
(1697, 'Viewed installment management for Agora Showroom Main', '20:14', '2025-09-09', 12),
(1698, 'Viewed installment management for Agora Showroom Main', '20:14', '2025-09-09', 12),
(1699, 'Viewed installment management for Agora Showroom Main', '20:15', '2025-09-09', 12),
(1700, 'Viewed installment management for Agora Showroom Main', '20:15', '2025-09-09', 12),
(1701, 'Viewed installment management for Agora Showroom Main', '20:16', '2025-09-09', 12),
(1702, 'Viewed installment management for Agora Showroom Main', '20:16', '2025-09-09', 12),
(1703, 'Viewed installment management for Agora Showroom Main', '20:16', '2025-09-09', 12),
(1704, 'Viewed installment management for Agora Showroom Main', '20:16', '2025-09-09', 12),
(1705, 'Viewed installment management for Agora Showroom Main', '20:29', '2025-09-09', 12),
(1706, 'Viewed installment management for Agora Showroom Main', '20:34', '2025-09-09', 12),
(1707, 'Viewed installment management for Agora Showroom Main', '20:34', '2025-09-09', 12),
(1708, 'Viewed installment management for Agora Showroom Main', '20:39', '2025-09-09', 12),
(1709, 'Viewed installment management for Agora Showroom Main', '20:40', '2025-09-09', 12),
(1710, 'Viewed installment management for Agora Showroom Main', '20:40', '2025-09-09', 12),
(1711, 'Online', '20:45', '2025-09-09', 9),
(1712, 'Get the inventory reports of A.G-122 in Warehouse CDO store', '20:45', '2025-09-09', 9),
(1713, 'Get the inventory reports of Warehouse CDO', '20:45', '2025-09-09', 9),
(1714, 'Get the inventory reports of Warehouse CDO', '20:45', '2025-09-09', 9),
(1715, 'Get the inventory reports of Warehouse CDO', '20:45', '2025-09-09', 9),
(1716, 'Get the inventory reports of Warehouse CDO', '20:45', '2025-09-09', 9),
(1717, 'Online', '20:45', '2025-09-09', 8),
(1718, 'Sent a request from Agora Showroom Main to Warehouse CDO', '20:46', '2025-09-09', 8),
(1719, 'Log Out', '21:01', '2025-09-09', 8),
(1720, 'Online', '21:01', '2025-09-09', 7),
(1721, 'Log Out', '21:01', '2025-09-09', 7),
(1722, 'Online', '21:01', '2025-09-09', 12),
(1723, 'Viewed installment management for Agora Showroom Main', '21:01', '2025-09-09', 12),
(1724, 'Viewed installment management for Agora Showroom Main', '21:01', '2025-09-09', 12),
(1725, 'Viewed installment management for Agora Showroom Main', '21:02', '2025-09-09', 12),
(1726, 'Viewed installment management for Agora Showroom Main', '21:02', '2025-09-09', 12),
(1727, 'Viewed installment management for Agora Showroom Main', '21:02', '2025-09-09', 12),
(1728, 'Viewed installment management for Agora Showroom Main', '21:02', '2025-09-09', 12),
(1729, 'Viewed installment management for Agora Showroom Main', '21:14', '2025-09-09', 12),
(1730, 'Viewed installment management for Agora Showroom Main', '21:14', '2025-09-09', 12),
(1731, 'Viewed installment management for Agora Showroom Main', '21:14', '2025-09-09', 12),
(1732, 'Viewed installment management for Agora Showroom Main', '21:14', '2025-09-09', 12),
(1733, 'Viewed installment management for Agora Showroom Main', '21:15', '2025-09-09', 12),
(1734, 'Viewed installment management for Agora Showroom Main', '21:15', '2025-09-09', 12),
(1735, 'Viewed installment management for Agora Showroom Main', '21:17', '2025-09-09', 12),
(1736, 'Viewed installment management for Agora Showroom Main', '21:17', '2025-09-09', 12),
(1737, 'Viewed installment management for Agora Showroom Main', '21:39', '2025-09-09', 12),
(1738, 'Viewed installment management for Agora Showroom Main', '21:39', '2025-09-09', 12),
(1739, 'Viewed installment management for Agora Showroom Main', '22:16', '2025-09-10', 12),
(1740, 'Viewed installment management for Agora Showroom Main', '22:16', '2025-09-10', 12),
(1741, 'Viewed installment management for Agora Showroom Main', '22:19', '2025-09-10', 12),
(1742, 'Viewed installment management for Agora Showroom Main', '22:19', '2025-09-10', 12),
(1743, 'Viewed installment management for Agora Showroom Main', '12:47', '2025-09-11', 12),
(1744, 'Viewed installment management for Agora Showroom Main', '12:47', '2025-09-11', 12),
(1745, 'Processed an installment sale at Agora Showroom Main, Invoice #51', '12:49', '2025-09-11', 12),
(1746, 'Viewed installment management for Agora Showroom Main', '12:49', '2025-09-11', 12),
(1747, 'Viewed installment management for Agora Showroom Main', '12:49', '2025-09-11', 12),
(1748, 'Viewed installment management for Agora Showroom Main', '12:50', '2025-09-11', 12),
(1749, 'Viewed installment management for Agora Showroom Main', '12:50', '2025-09-11', 12),
(1750, 'Viewed installment management for Agora Showroom Main', '12:50', '2025-09-11', 12),
(1751, 'Viewed installment management for Agora Showroom Main', '12:50', '2025-09-11', 12),
(1752, 'Viewed installment management for Agora Showroom Main', '12:51', '2025-09-11', 12),
(1753, 'Viewed installment management for Agora Showroom Main', '12:51', '2025-09-11', 12),
(1754, 'Get the inventory reports of all locations', '12:55', '2025-09-11', 7),
(1755, 'Get the inventory reports of all locations', '12:57', '2025-09-11', 7),
(1756, 'Viewed installment management for Agora Showroom Main', '12:57', '2025-09-11', 12),
(1757, 'Viewed installment management for Agora Showroom Main', '12:57', '2025-09-11', 12),
(1758, 'Viewed installment management for Agora Showroom Main', '13:02', '2025-09-11', 12),
(1759, 'Viewed installment management for Agora Showroom Main', '13:02', '2025-09-11', 12),
(1760, 'Viewed installment management for Agora Showroom Main', '13:02', '2025-09-11', 12),
(1761, 'Viewed installment management for Agora Showroom Main', '13:02', '2025-09-11', 12),
(1762, 'Viewed installment management for Agora Showroom Main', '13:02', '2025-09-11', 12),
(1763, 'Viewed installment management for Agora Showroom Main', '13:02', '2025-09-11', 12),
(1764, 'Viewed installment management for Agora Showroom Main', '13:02', '2025-09-11', 12),
(1765, 'Viewed installment management for Agora Showroom Main', '13:02', '2025-09-11', 12),
(1766, 'Log Out', '13:03', '2025-09-11', 12),
(1767, 'Online', '13:03', '2025-09-11', 8),
(1768, 'Request Stock Out List', '13:03', '2025-09-11', 8),
(1769, 'Viewed installment management for Agora Showroom Main', '13:04', '2025-09-11', 12),
(1770, 'Viewed installment management for Agora Showroom Main', '13:04', '2025-09-11', 12),
(1771, 'Get the inventory reports of Warehouse CDO', '13:05', '2025-09-11', 9),
(1772, 'Get the inventory reports of Warehouse CDO', '13:05', '2025-09-11', 9),
(1773, 'Get the inventory reports of Warehouse CDO', '13:05', '2025-09-11', 9),
(1774, 'Get the inventory reports of Warehouse CDO', '13:05', '2025-09-11', 9),
(1775, 'Get the inventory reports of Warehouse CDO', '13:08', '2025-09-11', 9),
(1776, 'Get the inventory reports of Warehouse CDO', '13:08', '2025-09-11', 9),
(1777, 'Get the inventory reports of Warehouse CDO', '13:08', '2025-09-11', 9),
(1778, 'Get the inventory reports of Warehouse CDO', '13:08', '2025-09-11', 9),
(1779, 'Viewed installment management for Agora Showroom Main', '13:16', '2025-09-11', 12),
(1780, 'Viewed installment management for Agora Showroom Main', '13:16', '2025-09-11', 12),
(1781, 'Log Out', '13:52', '2025-09-11', 12),
(1782, 'Log Out', '13:52', '2025-09-11', 9),
(1783, 'Log Out', '13:52', '2025-09-11', 8),
(1784, 'Log Out', '13:52', '2025-09-11', 7),
(1785, 'Online', '13:57', '2025-09-11', 9),
(1786, 'Online', '13:57', '2025-09-11', 8),
(1787, 'Request Stock Out List', '13:58', '2025-09-11', 8),
(1788, 'Request Stock Out List', '13:58', '2025-09-11', 8),
(1789, 'Sent a request from Agora Showroom Main to Warehouse CDO', '13:59', '2025-09-11', 8),
(1790, 'Accept the request #102', '13:59', '2025-09-11', 9),
(1791, 'Track the request #102', '13:59', '2025-09-11', 8),
(1792, 'Track the request #102', '14:00', '2025-09-11', 8),
(1793, 'Deliver the request #102', '14:00', '2025-09-11', 9),
(1794, 'Track the request #102', '14:01', '2025-09-11', 8),
(1795, 'Receive the delivery from request #102', '14:02', '2025-09-11', 8),
(1796, 'Get the inventory reports of Agora Showroom Main', '14:02', '2025-09-11', 8),
(1797, 'Get the inventory reports of Agora Showroom Main', '14:02', '2025-09-11', 8),
(1798, 'Get the inventory reports of Agora Showroom Main', '14:02', '2025-09-11', 8),
(1799, 'Get the inventory reports of Agora Showroom Main', '14:02', '2025-09-11', 8),
(1800, 'Log Out', '19:27', '2025-09-11', 8),
(1801, 'Log Out', '19:27', '2025-09-11', 9),
(1802, 'Online', '23:28', '2025-09-13', 9),
(1803, 'Online', '23:29', '2025-09-13', 7),
(1804, 'Log Out', '23:44', '2025-09-13', 9),
(1805, 'Online', '23:44', '2025-09-13', 8),
(1806, 'Log Out', '23:44', '2025-09-13', 8),
(1807, 'Online', '23:44', '2025-09-13', 12),
(1808, 'Online', '23:48', '2025-09-13', 8),
(1809, 'Online', '23:51', '2025-09-13', 7),
(1810, 'Log Out', '00:16', '2025-09-14', 7),
(1811, 'Online', '00:17', '2025-09-14', 8),
(1812, 'Get the inventory reports of Agora Showroom Main', '00:21', '2025-09-14', 8),
(1813, 'Get the inventory reports of Agora Showroom Main', '00:21', '2025-09-14', 8),
(1814, 'Get the inventory reports of Agora Showroom Main', '00:21', '2025-09-14', 8),
(1815, 'Get the inventory reports of Agora Showroom Main', '00:21', '2025-09-14', 8),
(1816, 'Get the inventory reports of Agora Showroom Main', '00:30', '2025-09-14', 8),
(1817, 'Get the inventory reports of Agora Showroom Main', '00:30', '2025-09-14', 8),
(1818, 'Get the inventory reports of Agora Showroom Main', '00:30', '2025-09-14', 8),
(1819, 'Get the inventory reports of Agora Showroom Main', '00:30', '2025-09-14', 8),
(1820, 'Request Stock Out List', '00:34', '2025-09-14', 8),
(1821, 'Online', '00:37', '2025-09-14', 8),
(1822, 'Online', '00:41', '2025-09-14', 9),
(1823, 'Get the inventory reports of Warehouse CDO', '00:41', '2025-09-14', 9),
(1824, 'Get the inventory reports of Warehouse CDO', '00:41', '2025-09-14', 9),
(1825, 'Get the inventory reports of Warehouse CDO', '00:41', '2025-09-14', 9),
(1826, 'Get the inventory reports of Warehouse CDO', '00:41', '2025-09-14', 9),
(1827, 'Sent a request from Jasaan Showroom to Warehouse CDO', '00:41', '2025-09-14', 8),
(1828, 'Log Out', '00:42', '2025-09-14', 12),
(1829, 'Accept the request #103', '00:44', '2025-09-14', 9),
(1830, 'Get the inventory reports of Agora Showroom Main', '00:44', '2025-09-14', 8),
(1831, 'Get the inventory reports of Agora Showroom Main', '00:44', '2025-09-14', 8),
(1832, 'Get the inventory reports of Agora Showroom Main', '00:44', '2025-09-14', 8),
(1833, 'Get the inventory reports of Agora Showroom Main', '00:44', '2025-09-14', 8),
(1834, 'Get the inventory reports of Agora Showroom Main', '00:45', '2025-09-14', 8),
(1835, 'Get the inventory reports of Agora Showroom Main', '00:45', '2025-09-14', 8),
(1836, 'Get the inventory reports of Agora Showroom Main', '00:45', '2025-09-14', 8),
(1837, 'Get the inventory reports of Agora Showroom Main', '00:45', '2025-09-14', 8),
(1838, 'Get the inventory reports of Agora Showroom Main', '00:45', '2025-09-14', 8),
(1839, 'Get the inventory reports of Agora Showroom Main', '00:45', '2025-09-14', 8),
(1840, 'Get the inventory reports of Agora Showroom Main', '00:45', '2025-09-14', 8),
(1841, 'Get the inventory reports of Agora Showroom Main', '00:45', '2025-09-14', 8),
(1842, 'Get the inventory reports of Agora Showroom Main', '00:45', '2025-09-14', 8),
(1843, 'Get the inventory reports of A.G-1 in Agora Showroom Main store', '00:46', '2025-09-14', 8),
(1844, 'Get the inventory reports of A.G-122 in Agora Showroom Main store', '00:46', '2025-09-14', 8),
(1845, 'Get the inventory reports of A.G-122 in Agora Showroom Main store', '00:46', '2025-09-14', 8),
(1846, 'Get the inventory reports of A.G-122 in Agora Showroom Main store', '00:46', '2025-09-14', 8),
(1847, 'Get the inventory reports of A.G-122 in Agora Showroom Main store', '00:46', '2025-09-14', 8),
(1848, 'Get the inventory reports of A.G-5 in Agora Showroom Main store', '00:46', '2025-09-14', 8),
(1849, 'Online', '00:46', '2025-09-14', 12),
(1850, 'Viewed installment management for Agora Showroom Main', '00:46', '2025-09-14', 12),
(1851, 'Viewed installment management for Agora Showroom Main', '00:46', '2025-09-14', 12),
(1852, 'Viewed installment management for Agora Showroom Main', '00:46', '2025-09-14', 12),
(1853, 'Viewed installment management for Agora Showroom Main', '00:46', '2025-09-14', 12),
(1854, 'Log Out', '00:47', '2025-09-14', 12),
(1855, 'Track the request #101', '00:47', '2025-09-14', 8),
(1856, 'Track the request #102', '00:48', '2025-09-14', 8),
(1857, 'Track the request #100', '00:48', '2025-09-14', 8),
(1858, 'Track the request #100', '00:48', '2025-09-14', 8),
(1859, 'Track the request #101', '00:48', '2025-09-14', 8),
(1860, 'Track the request #90', '00:48', '2025-09-14', 8),
(1861, 'Track the request #102', '00:48', '2025-09-14', 8),
(1862, 'Track the request #101', '00:48', '2025-09-14', 8),
(1863, 'Track the request #100', '00:48', '2025-09-14', 8),
(1864, 'Track the request #97', '00:48', '2025-09-14', 8),
(1865, 'Track the request #96', '00:48', '2025-09-14', 8),
(1866, 'Track the request #96', '00:48', '2025-09-14', 8),
(1867, 'Track the request #102', '00:48', '2025-09-14', 8),
(1868, 'Track the request #102', '00:49', '2025-09-14', 8),
(1869, 'Track the request #100', '00:49', '2025-09-14', 8),
(1870, 'Track the request #100', '00:49', '2025-09-14', 8),
(1871, 'Track the request #101', '00:49', '2025-09-14', 8),
(1872, 'Track the request #101', '00:49', '2025-09-14', 8),
(1873, 'Track the request #103', '00:50', '2025-09-14', 8),
(1874, 'Track the request #102', '00:50', '2025-09-14', 8),
(1875, 'Track the request #102', '00:51', '2025-09-14', 8),
(1876, 'Online', '00:51', '2025-09-14', 8),
(1877, 'Online', '00:52', '2025-09-14', 12),
(1878, 'Track the request #103', '00:52', '2025-09-14', 8),
(1879, 'Track the request #103', '00:53', '2025-09-14', 8),
(1880, 'Deliver the request #103', '00:53', '2025-09-14', 9),
(1881, 'Receive the delivery from request #103', '00:53', '2025-09-14', 8),
(1882, 'Get the inventory reports of Agora Showroom Main', '00:53', '2025-09-14', 8),
(1883, 'Get the inventory reports of Agora Showroom Main', '00:53', '2025-09-14', 8),
(1884, 'Get the inventory reports of Agora Showroom Main', '00:53', '2025-09-14', 8),
(1885, 'Get the inventory reports of Agora Showroom Main', '00:53', '2025-09-14', 8),
(1886, 'Get the inventory reports of Agora Showroom Main', '00:53', '2025-09-14', 8),
(1887, 'Mark the request #103 to complete', '00:53', '2025-09-14', 9),
(1888, 'Get the inventory reports of Agora Showroom Main', '00:54', '2025-09-14', 8),
(1889, 'Get the inventory reports of Agora Showroom Main', '00:54', '2025-09-14', 8),
(1890, 'Get the inventory reports of Agora Showroom Main', '00:54', '2025-09-14', 8),
(1891, 'Get the inventory reports of Agora Showroom Main', '00:54', '2025-09-14', 8),
(1892, 'Track the request #98', '00:54', '2025-09-14', 8),
(1893, 'Track the request #94', '00:56', '2025-09-14', 8),
(1894, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-09-14', 9),
(1895, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-09-14', 9),
(1896, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-09-14', 9),
(1897, 'Get the inventory reports of Warehouse CDO', '00:56', '2025-09-14', 9),
(1898, 'Track the request #91', '00:57', '2025-09-14', 8),
(1899, 'Get the inventory reports of Warehouse CDO', '00:59', '2025-09-14', 9),
(1900, 'Get the inventory reports of Warehouse CDO', '00:59', '2025-09-14', 9),
(1901, 'Get the inventory reports of Warehouse CDO', '00:59', '2025-09-14', 9),
(1902, 'Get the inventory reports of Warehouse CDO', '00:59', '2025-09-14', 9),
(1903, 'Get the inventory reports of Warehouse CDO', '00:59', '2025-09-14', 9),
(1904, 'Get the inventory reports of Warehouse CDO', '00:59', '2025-09-14', 9),
(1905, 'Get the inventory reports of Warehouse CDO', '00:59', '2025-09-14', 9),
(1906, 'Get the inventory reports of Warehouse CDO', '00:59', '2025-09-14', 9),
(1907, 'Get the inventory reports of Agora Showroom Main', '01:02', '2025-09-14', 8),
(1908, 'Get the inventory reports of Agora Showroom Main', '01:02', '2025-09-14', 8),
(1909, 'Get the inventory reports of Agora Showroom Main', '01:02', '2025-09-14', 8),
(1910, 'Get the inventory reports of Agora Showroom Main', '01:02', '2025-09-14', 8),
(1911, 'Receive the delivery from request #98', '01:02', '2025-09-14', 8),
(1912, 'Get the inventory reports of Agora Showroom Main', '01:02', '2025-09-14', 8),
(1913, 'Get the inventory reports of Agora Showroom Main', '01:02', '2025-09-14', 8),
(1914, 'Get the inventory reports of Agora Showroom Main', '01:02', '2025-09-14', 8),
(1915, 'Get the inventory reports of Agora Showroom Main', '01:02', '2025-09-14', 8),
(1916, 'Mark the request #98 to complete', '01:02', '2025-09-14', 9),
(1917, 'Get the inventory reports of Agora Showroom Main', '01:06', '2025-09-14', 8),
(1918, 'Get the inventory reports of Agora Showroom Main', '01:06', '2025-09-14', 8),
(1919, 'Get the inventory reports of Agora Showroom Main', '01:06', '2025-09-14', 8),
(1920, 'Get the inventory reports of Agora Showroom Main', '01:06', '2025-09-14', 8),
(1921, 'Sent a request from Agora Showroom Main to Warehouse CDO', '01:10', '2025-09-14', 8),
(1922, 'Track the request #104', '01:11', '2025-09-14', 8),
(1923, 'Track the request #104', '01:11', '2025-09-14', 8),
(1924, 'Get the inventory reports of Agora Showroom Main', '01:11', '2025-09-14', 8),
(1925, 'Get the inventory reports of Agora Showroom Main', '01:11', '2025-09-14', 8),
(1926, 'Get the inventory reports of Agora Showroom Main', '01:11', '2025-09-14', 8),
(1927, 'Get the inventory reports of Agora Showroom Main', '01:11', '2025-09-14', 8),
(1928, 'Get the inventory reports of Agora Showroom Main', '01:12', '2025-09-14', 8),
(1929, 'Get the inventory reports of Agora Showroom Main', '01:12', '2025-09-14', 8),
(1930, 'Get the inventory reports of Agora Showroom Main', '01:12', '2025-09-14', 8),
(1931, 'Get the inventory reports of Agora Showroom Main', '01:12', '2025-09-14', 8),
(1932, 'Get the inventory reports of Agora Showroom Main', '01:12', '2025-09-14', 8),
(1933, 'Get the inventory reports of Agora Showroom Main', '01:12', '2025-09-14', 8),
(1934, 'Get the inventory reports of Agora Showroom Main', '01:12', '2025-09-14', 8),
(1935, 'Get the inventory reports of Agora Showroom Main', '01:12', '2025-09-14', 8),
(1936, 'Track the request #104', '01:12', '2025-09-14', 8),
(1937, 'Get the inventory reports of Agora Showroom Main', '01:13', '2025-09-14', 8),
(1938, 'Get the inventory reports of Agora Showroom Main', '01:13', '2025-09-14', 8),
(1939, 'Get the inventory reports of Agora Showroom Main', '01:13', '2025-09-14', 8),
(1940, 'Get the inventory reports of Agora Showroom Main', '01:13', '2025-09-14', 8),
(1941, 'Sent a request from Agora Showroom Main to Warehouse CDO', '01:14', '2025-09-14', 8),
(1942, 'Accept the request #104', '01:16', '2025-09-14', 9),
(1943, 'Track the request #105', '01:16', '2025-09-14', 8),
(1944, 'Deliver the request #104', '01:16', '2025-09-14', 9),
(1945, 'Track the request #104', '01:16', '2025-09-14', 8),
(1946, 'Track the request #104', '01:16', '2025-09-14', 8),
(1947, 'Track the request #104', '01:16', '2025-09-14', 8),
(1948, 'Receive the delivery from request #104', '01:17', '2025-09-14', 8),
(1949, 'Mark the request #104 to complete', '01:17', '2025-09-14', 9),
(1950, 'Track the request #104', '01:17', '2025-09-14', 8),
(1951, 'Track the request #104', '01:17', '2025-09-14', 8),
(1952, 'Get the inventory reports of Warehouse CDO', '01:17', '2025-09-14', 9),
(1953, 'Get the inventory reports of Warehouse CDO', '01:17', '2025-09-14', 9),
(1954, 'Get the inventory reports of Warehouse CDO', '01:17', '2025-09-14', 9),
(1955, 'Get the inventory reports of Warehouse CDO', '01:17', '2025-09-14', 9),
(1956, 'Get the inventory reports of Warehouse CDO', '01:17', '2025-09-14', 9),
(1957, 'Get the inventory reports of Warehouse CDO', '01:17', '2025-09-14', 9),
(1958, 'Get the inventory reports of Warehouse CDO', '01:17', '2025-09-14', 9),
(1959, 'Get the inventory reports of Warehouse CDO', '01:17', '2025-09-14', 9),
(1960, 'Get the inventory reports of Agora Showroom Main', '01:18', '2025-09-14', 8),
(1961, 'Get the inventory reports of Agora Showroom Main', '01:18', '2025-09-14', 8),
(1962, 'Get the inventory reports of Agora Showroom Main', '01:18', '2025-09-14', 8),
(1963, 'Get the inventory reports of Agora Showroom Main', '01:18', '2025-09-14', 8),
(1964, 'Get the inventory reports of Warehouse CDO', '01:20', '2025-09-14', 9),
(1965, 'Get the inventory reports of Warehouse CDO', '01:20', '2025-09-14', 9),
(1966, 'Get the inventory reports of Warehouse CDO', '01:20', '2025-09-14', 9),
(1967, 'Get the inventory reports of Warehouse CDO', '01:20', '2025-09-14', 9),
(1968, 'Log Out', '01:21', '2025-09-14', 8),
(1969, 'Online', '01:21', '2025-09-14', 9),
(1970, 'Get the inventory reports of Warehouse CDO', '01:21', '2025-09-14', 9),
(1971, 'Get the inventory reports of Warehouse CDO', '01:21', '2025-09-14', 9),
(1972, 'Get the inventory reports of Warehouse CDO', '01:21', '2025-09-14', 9),
(1973, 'Get the inventory reports of Warehouse CDO', '01:21', '2025-09-14', 9),
(1974, 'Get the inventory reports of Warehouse CDO', '01:21', '2025-09-14', 9),
(1975, 'Get the inventory reports of Warehouse CDO', '01:21', '2025-09-14', 9),
(1976, 'Get the inventory reports of Warehouse CDO', '01:21', '2025-09-14', 9),
(1977, 'Get the inventory reports of Warehouse CDO', '01:21', '2025-09-14', 9),
(1978, 'Log Out', '01:23', '2025-09-14', 9),
(1979, 'Online', '01:24', '2025-09-14', 7),
(1980, 'Log Out', '01:25', '2025-09-14', 7),
(1981, 'Track the request #91', '03:29', '2025-09-14', 8),
(1982, 'Track the request #62', '03:29', '2025-09-14', 8),
(1983, 'Track the request #105', '03:29', '2025-09-14', 8),
(1984, 'Track the request #103', '04:07', '2025-09-14', 8),
(1985, 'Track the request #104', '04:07', '2025-09-14', 8),
(1986, 'Track the request #62', '04:29', '2025-09-14', 8),
(1987, 'Track the request #104', '04:30', '2025-09-14', 8),
(1988, 'Track the request #104', '04:32', '2025-09-14', 8),
(1989, 'Get the inventory reports of Agora Showroom Main', '04:48', '2025-09-14', 8),
(1990, 'Get the inventory reports of Agora Showroom Main', '04:48', '2025-09-14', 8),
(1991, 'Get the inventory reports of Agora Showroom Main', '04:48', '2025-09-14', 8),
(1992, 'Get the inventory reports of Agora Showroom Main', '04:48', '2025-09-14', 8),
(1993, 'Online', '05:42', '2025-09-14', 7),
(1994, 'Online', '06:25', '2025-09-14', 16),
(1995, 'Viewed installment management for Jasaan Showroom', '06:25', '2025-09-14', 16),
(1996, 'Viewed installment management for Jasaan Showroom', '06:25', '2025-09-14', 16),
(1997, 'Processed an installment sale at Jasaan Showroom, Invoice #52', '06:25', '2025-09-14', 16),
(1998, 'Viewed installment management for Jasaan Showroom', '20:22', '2025-09-14', 16),
(1999, 'Viewed installment management for Jasaan Showroom', '20:22', '2025-09-14', 16),
(2000, 'Viewed installment management for Jasaan Showroom', '20:23', '2025-09-14', 16),
(2001, 'Viewed installment management for Jasaan Showroom', '20:23', '2025-09-14', 16),
(2002, 'Viewed installment management for Jasaan Showroom', '20:24', '2025-09-14', 16),
(2003, 'Viewed installment management for Jasaan Showroom', '20:24', '2025-09-14', 16),
(2004, 'Viewed installment management for Jasaan Showroom', '20:26', '2025-09-14', 16),
(2005, 'Viewed installment management for Jasaan Showroom', '20:26', '2025-09-14', 16),
(2006, 'Viewed installment management for Jasaan Showroom', '20:31', '2025-09-14', 16),
(2007, 'Viewed installment management for Jasaan Showroom', '20:32', '2025-09-14', 16),
(2008, 'Viewed installment management for Jasaan Showroom', '20:32', '2025-09-14', 16),
(2009, 'Viewed installment management for Jasaan Showroom', '20:32', '2025-09-14', 16),
(2010, 'Viewed installment management for Jasaan Showroom', '20:32', '2025-09-14', 16),
(2011, 'Viewed installment management for Jasaan Showroom', '20:54', '2025-09-14', 16),
(2012, 'Viewed installment management for Jasaan Showroom', '20:54', '2025-09-14', 16),
(2013, 'Log Out', '22:32', '2025-09-14', 16),
(2014, 'Log Out', '23:31', '2025-09-14', 7),
(2015, 'Log Out', '23:31', '2025-09-14', 8),
(2016, 'Log Out', '23:31', '2025-09-14', 9),
(2017, 'Log Out', '23:31', '2025-09-14', 8),
(2018, 'Online', '21:29', '2025-09-15', 7),
(2019, 'Get the inventory reports of all locations', '21:53', '2025-09-15', 7),
(2020, 'Get the inventory reports of all locations', '21:56', '2025-09-15', 7),
(2021, 'Online', '19:10', '2025-09-17', 12),
(2022, 'Viewed installment management for Agora Showroom Main', '19:10', '2025-09-17', 12),
(2023, 'Viewed installment management for Agora Showroom Main', '19:10', '2025-09-17', 12),
(2024, 'Viewed installment management for Agora Showroom Main', '19:10', '2025-09-17', 12),
(2025, 'Viewed installment management for Agora Showroom Main', '19:10', '2025-09-17', 12),
(2026, 'Viewed installment management for Agora Showroom Main', '19:15', '2025-09-17', 12),
(2027, 'Viewed installment management for Agora Showroom Main', '19:15', '2025-09-17', 12),
(2028, 'Viewed installment management for Agora Showroom Main', '00:11', '2025-09-18', 12),
(2029, 'Viewed installment management for Agora Showroom Main', '00:11', '2025-09-18', 12),
(2030, 'Online', '06:15', '2025-09-18', 12),
(2031, 'Viewed installment management for Agora Showroom Main', '06:15', '2025-09-18', 12),
(2032, 'Viewed installment management for Agora Showroom Main', '06:15', '2025-09-18', 12),
(2033, 'Viewed installment management for Agora Showroom Main', '06:15', '2025-09-18', 12),
(2034, 'Viewed installment management for Agora Showroom Main', '06:15', '2025-09-18', 12),
(2035, 'Viewed installment management for Agora Showroom Main', '06:17', '2025-09-18', 12),
(2036, 'Viewed installment management for Agora Showroom Main', '06:17', '2025-09-18', 12),
(2037, 'Viewed installment management for Agora Showroom Main', '06:24', '2025-09-18', 12),
(2038, 'Viewed installment management for Agora Showroom Main', '06:27', '2025-09-18', 12),
(2039, 'Viewed installment management for Agora Showroom Main', '06:27', '2025-09-18', 12),
(2040, 'Viewed installment management for Agora Showroom Main', '06:27', '2025-09-18', 12),
(2041, 'Viewed installment management for Agora Showroom Main', '06:29', '2025-09-18', 12),
(2042, 'Viewed installment management for Agora Showroom Main', '06:29', '2025-09-18', 12),
(2043, 'Viewed installment management for Agora Showroom Main', '07:03', '2025-09-18', 12),
(2044, 'Viewed installment management for Agora Showroom Main', '07:03', '2025-09-18', 12),
(2045, 'Viewed installment management for Agora Showroom Main', '07:11', '2025-09-18', 12),
(2046, 'Viewed installment management for Agora Showroom Main', '07:34', '2025-09-18', 12),
(2047, 'Viewed installment management for Agora Showroom Main', '07:34', '2025-09-18', 12),
(2048, 'Viewed installment management for Agora Showroom Main', '07:34', '2025-09-18', 12),
(2049, 'Viewed installment management for Agora Showroom Main', '07:37', '2025-09-18', 12),
(2050, 'Viewed installment management for Agora Showroom Main', '07:37', '2025-09-18', 12),
(2051, 'Viewed installment management for Agora Showroom Main', '07:38', '2025-09-18', 12),
(2052, 'Viewed installment management for Agora Showroom Main', '13:52', '2025-09-18', 12),
(2053, 'Viewed installment management for Agora Showroom Main', '13:52', '2025-09-18', 12),
(2054, 'Viewed installment management for Agora Showroom Main', '13:55', '2025-09-18', 12),
(2055, 'Viewed installment management for Agora Showroom Main', '13:55', '2025-09-18', 12),
(2056, 'Viewed installment management for Agora Showroom Main', '13:56', '2025-09-18', 12),
(2057, 'Viewed installment management for Agora Showroom Main', '13:56', '2025-09-18', 12),
(2058, 'Viewed installment management for Agora Showroom Main', '13:56', '2025-09-18', 12),
(2059, 'Viewed installment management for Agora Showroom Main', '13:56', '2025-09-18', 12),
(2060, 'Viewed installment management for Agora Showroom Main', '13:56', '2025-09-18', 12),
(2061, 'Viewed installment management for Agora Showroom Main', '13:56', '2025-09-18', 12),
(2062, 'Viewed installment management for Agora Showroom Main', '13:58', '2025-09-18', 12),
(2063, 'Viewed installment management for Agora Showroom Main', '13:58', '2025-09-18', 12),
(2064, 'Viewed installment management for Agora Showroom Main', '13:59', '2025-09-18', 12),
(2065, 'Viewed installment management for Agora Showroom Main', '13:59', '2025-09-18', 12),
(2066, 'Viewed installment management for Agora Showroom Main', '14:01', '2025-09-18', 12),
(2067, 'Viewed installment management for Agora Showroom Main', '14:01', '2025-09-18', 12),
(2068, 'Online', '14:29', '2025-09-18', 7),
(2069, 'Online', '14:55', '2025-09-18', 12),
(2070, 'Viewed installment management for Agora Showroom Main', '14:56', '2025-09-18', 12),
(2071, 'Viewed installment management for Agora Showroom Main', '14:56', '2025-09-18', 12),
(2072, 'Viewed installment management for Agora Showroom Main', '15:02', '2025-09-18', 12),
(2073, 'Viewed installment management for Agora Showroom Main', '15:03', '2025-09-18', 12),
(2074, 'Viewed installment management for Agora Showroom Main', '15:06', '2025-09-18', 12),
(2075, 'Viewed installment management for Agora Showroom Main', '15:06', '2025-09-18', 12),
(2076, 'Viewed installment management for Agora Showroom Main', '23:22', '2025-09-18', 12),
(2077, 'Viewed installment management for Agora Showroom Main', '23:22', '2025-09-18', 12),
(2078, 'Viewed installment management for Agora Showroom Main', '23:31', '2025-09-18', 12),
(2079, 'Viewed installment management for Agora Showroom Main', '23:33', '2025-09-18', 12),
(2080, 'Viewed installment management for Agora Showroom Main', '23:35', '2025-09-18', 12),
(2081, 'Viewed installment management for Agora Showroom Main', '23:35', '2025-09-18', 12),
(2082, 'Viewed installment management for Agora Showroom Main', '23:35', '2025-09-18', 12),
(2083, 'Viewed installment management for Agora Showroom Main', '10:40', '2025-09-20', 12),
(2084, 'Viewed installment management for Agora Showroom Main', '10:40', '2025-09-20', 12),
(2085, 'Viewed installment management for Agora Showroom Main', '10:40', '2025-09-20', 12),
(2086, 'Viewed installment management for Agora Showroom Main', '10:40', '2025-09-20', 12),
(2087, 'Viewed installment management for Agora Showroom Main', '11:24', '2025-09-20', 12),
(2088, 'Viewed installment management for Agora Showroom Main', '11:24', '2025-09-20', 12),
(2089, 'Viewed installment management for Agora Showroom Main', '11:26', '2025-09-20', 12),
(2090, 'Viewed installment management for Agora Showroom Main', '11:26', '2025-09-20', 12),
(2091, 'Viewed installment management for Agora Showroom Main', '11:27', '2025-09-20', 12),
(2092, 'Viewed installment management for Agora Showroom Main', '11:27', '2025-09-20', 12),
(2093, 'Viewed installment management for Agora Showroom Main', '11:29', '2025-09-20', 12),
(2094, 'Viewed installment management for Agora Showroom Main', '11:29', '2025-09-20', 12),
(2095, 'Viewed installment management for Agora Showroom Main', '11:35', '2025-09-20', 12),
(2096, 'Viewed installment management for Agora Showroom Main', '11:35', '2025-09-20', 12),
(2097, 'Viewed installment management for Agora Showroom Main', '11:38', '2025-09-20', 12),
(2098, 'Viewed installment management for Agora Showroom Main', '11:38', '2025-09-20', 12),
(2099, 'Viewed installment management for Agora Showroom Main', '11:38', '2025-09-20', 12),
(2100, 'Viewed installment management for Agora Showroom Main', '11:38', '2025-09-20', 12),
(2101, 'Online', '11:40', '2025-09-20', 9),
(2102, 'Get the inventory reports of Warehouse CDO', '11:41', '2025-09-20', 9),
(2103, 'Get the inventory reports of Warehouse CDO', '11:41', '2025-09-20', 9),
(2104, 'Get the inventory reports of Warehouse CDO', '11:41', '2025-09-20', 9),
(2105, 'Get the inventory reports of Warehouse CDO', '11:41', '2025-09-20', 9),
(2106, 'Viewed installment management for Agora Showroom Main', '11:49', '2025-09-20', 12),
(2107, 'Viewed installment management for Agora Showroom Main', '11:49', '2025-09-20', 12),
(2108, 'Viewed installment management for Agora Showroom Main', '11:49', '2025-09-20', 12);
INSERT INTO `activity_log` (`activity_log_id`, `activity`, `time`, `date`, `account_id`) VALUES
(2109, 'Viewed installment management for Agora Showroom Main', '11:49', '2025-09-20', 12),
(2110, 'Viewed installment management for Agora Showroom Main', '22:35', '2025-09-21', 12),
(2111, 'Viewed installment management for Agora Showroom Main', '22:35', '2025-09-21', 12),
(2112, 'Viewed installment management for Agora Showroom Main', '22:45', '2025-09-21', 12),
(2113, 'Viewed installment management for Agora Showroom Main', '22:45', '2025-09-21', 12),
(2114, 'Viewed installment management for Agora Showroom Main', '23:10', '2025-09-21', 12),
(2115, 'Viewed installment management for Agora Showroom Main', '23:10', '2025-09-21', 12),
(2116, 'Viewed installment management for Agora Showroom Main', '23:12', '2025-09-21', 12),
(2117, 'Viewed installment management for Agora Showroom Main', '23:12', '2025-09-21', 12),
(2118, 'Viewed installment management for Agora Showroom Main', '23:12', '2025-09-21', 12),
(2119, 'Viewed installment management for Agora Showroom Main', '23:12', '2025-09-21', 12),
(2120, 'Log Out', '23:13', '2025-09-21', 12),
(2121, 'Online', '23:21', '2025-09-21', 7),
(2122, 'Log Out', '13:44', '2025-09-22', 7),
(2123, 'Online', '13:47', '2025-09-22', 7),
(2124, 'Online', '14:22', '2025-09-22', 8),
(2125, 'Log Out', '14:25', '2025-09-22', 8),
(2126, 'Online', '14:26', '2025-09-22', 7),
(2127, 'Log Out', '14:36', '2025-09-22', 7),
(2128, 'Online', '14:37', '2025-09-22', 8),
(2129, 'Get the inventory reports of A.G-122 in Agora Showroom Main store', '14:39', '2025-09-22', 8),
(2130, 'Request Stock Out List', '14:43', '2025-09-22', 8),
(2131, 'Track the request #62', '17:01', '2025-09-22', 8),
(2132, 'Track the request #105', '17:01', '2025-09-22', 8),
(2133, 'Online', '17:04', '2025-09-22', 7),
(2134, 'Get the inventory reports of Agora Showroom Main', '17:07', '2025-09-22', 8),
(2135, 'Get the inventory reports of Agora Showroom Main', '17:07', '2025-09-22', 8),
(2136, 'Get the inventory reports of Agora Showroom Main', '17:07', '2025-09-22', 8),
(2137, 'Get the inventory reports of Agora Showroom Main', '17:07', '2025-09-22', 8),
(2138, 'Get the inventory reports of Agora Showroom Main', '17:11', '2025-09-22', 8),
(2139, 'Get the inventory reports of Agora Showroom Main', '17:11', '2025-09-22', 8),
(2140, 'Get the inventory reports of Agora Showroom Main', '17:11', '2025-09-22', 8),
(2141, 'Get the inventory reports of Agora Showroom Main', '17:11', '2025-09-22', 8),
(2142, 'Log Out', '17:15', '2025-09-22', 8),
(2143, 'Online', '17:16', '2025-09-22', 9),
(2144, 'Online', '17:16', '2025-09-22', 7),
(2145, 'Log Out', '17:24', '2025-09-22', 7),
(2146, 'Online', '17:24', '2025-09-22', 7),
(2147, 'Log Out', '17:24', '2025-09-22', 7),
(2148, 'Online', '17:24', '2025-09-22', 7),
(2149, 'Online', '17:26', '2025-09-22', 7),
(2150, 'Log Out', '17:27', '2025-09-22', 9),
(2151, 'Online', '17:28', '2025-09-22', 9),
(2152, 'Log Out', '17:28', '2025-09-22', 7),
(2153, 'Online', '17:28', '2025-09-22', 7),
(2154, 'Log Out', '17:29', '2025-09-22', 9),
(2155, 'Online', '17:29', '2025-09-22', 9),
(2156, 'Online', '17:30', '2025-09-22', 12),
(2157, 'Online', '17:41', '2025-09-22', 8),
(2158, 'Online', '17:45', '2025-09-22', 7),
(2159, 'Online', '17:45', '2025-09-22', 9),
(2160, 'Online', '17:46', '2025-09-22', 7),
(2161, 'Online', '17:46', '2025-09-22', 9),
(2162, 'Online', '17:46', '2025-09-22', 7),
(2163, 'Online', '17:47', '2025-09-22', 9),
(2164, 'Online', '17:47', '2025-09-22', 7),
(2165, 'Get the inventory reports of Warehouse CDO', '17:48', '2025-09-22', 9),
(2166, 'Get the inventory reports of Warehouse CDO', '17:48', '2025-09-22', 9),
(2167, 'Get the inventory reports of Warehouse CDO', '17:48', '2025-09-22', 9),
(2168, 'Get the inventory reports of Warehouse CDO', '17:48', '2025-09-22', 9),
(2169, 'Get the inventory reports of Warehouse CDO', '17:49', '2025-09-22', 9),
(2170, 'Get the inventory reports of Warehouse CDO', '17:49', '2025-09-22', 9),
(2171, 'Get the inventory reports of Warehouse CDO', '17:49', '2025-09-22', 9),
(2172, 'Get the inventory reports of Warehouse CDO', '17:49', '2025-09-22', 9),
(2173, 'Online', '17:50', '2025-09-22', 7),
(2174, 'Mark the request #82 to complete', '17:51', '2025-09-22', 9),
(2175, 'Online', '17:51', '2025-09-22', 7),
(2176, 'Online', '17:52', '2025-09-22', 9),
(2177, 'Online', '17:53', '2025-09-22', 9),
(2178, 'Online', '17:56', '2025-09-22', 9),
(2179, 'Online', '17:58', '2025-09-22', 8),
(2180, 'Online', '17:58', '2025-09-22', 8),
(2181, 'Online', '18:01', '2025-09-22', 8),
(2182, 'Log Out', '18:09', '2025-09-22', 9),
(2183, 'Online', '18:10', '2025-09-22', 7),
(2184, 'Viewed installment management for Agora Showroom Main', '18:12', '2025-09-22', 12),
(2185, 'Viewed installment management for Agora Showroom Main', '18:12', '2025-09-22', 12),
(2186, 'Online', '18:15', '2025-09-22', 12),
(2187, 'Viewed installment management for Agora Showroom Main', '18:15', '2025-09-22', 12),
(2188, 'Viewed installment management for Agora Showroom Main', '18:15', '2025-09-22', 12),
(2189, 'Viewed installment management for Agora Showroom Main', '18:15', '2025-09-22', 12),
(2190, 'Viewed installment management for Agora Showroom Main', '18:15', '2025-09-22', 12),
(2191, 'Viewed installment management for Agora Showroom Main', '18:15', '2025-09-22', 12),
(2192, 'Viewed installment management for Agora Showroom Main', '18:15', '2025-09-22', 12),
(2193, 'Log Out', '18:16', '2025-09-22', 12),
(2194, 'Viewed installment management for Agora Showroom Main', '18:16', '2025-09-22', 12),
(2195, 'Viewed installment management for Agora Showroom Main', '18:16', '2025-09-22', 12),
(2196, 'Viewed installment management for Agora Showroom Main', '18:16', '2025-09-22', 12),
(2197, 'Viewed installment management for Agora Showroom Main', '18:16', '2025-09-22', 12),
(2198, 'Viewed installment management for Agora Showroom Main', '18:19', '2025-09-22', 12),
(2199, 'Viewed installment management for Agora Showroom Main', '18:19', '2025-09-22', 12),
(2200, 'Viewed installment management for Agora Showroom Main', '18:20', '2025-09-22', 12),
(2201, 'Viewed installment management for Agora Showroom Main', '18:20', '2025-09-22', 12),
(2202, 'Online', '18:22', '2025-09-22', 12),
(2203, 'Online', '18:32', '2025-09-22', 7),
(2204, 'Viewed installment management for Agora Showroom Main', '20:08', '2025-09-22', 12),
(2205, 'Viewed installment management for Agora Showroom Main', '20:08', '2025-09-22', 12),
(2206, 'Viewed installment management for Agora Showroom Main', '20:48', '2025-09-22', 12),
(2207, 'Viewed installment management for Agora Showroom Main', '20:48', '2025-09-22', 12),
(2208, 'Viewed installment management for Agora Showroom Main', '20:48', '2025-09-22', 12),
(2209, 'Viewed installment management for Agora Showroom Main', '20:48', '2025-09-22', 12),
(2210, 'Viewed installment management for Agora Showroom Main', '20:49', '2025-09-22', 12),
(2211, 'Viewed installment management for Agora Showroom Main', '20:49', '2025-09-22', 12),
(2212, 'Get the inventory reports of A.G-122 in null store', '20:50', '2025-09-22', 7),
(2213, 'Get the inventory reports of all locations', '20:50', '2025-09-22', 7),
(2214, 'Get the inventory reports of A.G-122 in null store', '20:50', '2025-09-22', 7),
(2215, 'Viewed installment management for Agora Showroom Main', '21:01', '2025-09-22', 12),
(2216, 'Viewed installment management for Agora Showroom Main', '21:01', '2025-09-22', 12),
(2217, 'Viewed installment management for Agora Showroom Main', '21:01', '2025-09-22', 12),
(2218, 'Viewed installment management for Agora Showroom Main', '21:01', '2025-09-22', 12),
(2219, 'Viewed installment management for Agora Showroom Main', '22:43', '2025-09-22', 12),
(2220, 'Viewed installment management for Agora Showroom Main', '22:43', '2025-09-22', 12),
(2221, 'Online', '23:08', '2025-09-22', 7),
(2222, 'Viewed installment management for Agora Showroom Main', '23:51', '2025-09-22', 12),
(2223, 'Viewed installment management for Agora Showroom Main', '23:51', '2025-09-22', 12),
(2224, 'Online', '00:24', '2025-09-23', 8),
(2225, 'Online', '00:25', '2025-09-23', 7),
(2226, 'Online', '00:25', '2025-09-23', 9),
(2227, 'Viewed installment management for Agora Showroom Main', '01:10', '2025-09-23', 12),
(2228, 'Viewed installment management for Agora Showroom Main', '01:10', '2025-09-23', 12),
(2229, 'Get the inventory reports of Agora Showroom Main', '01:11', '2025-09-23', 8),
(2230, 'Get the inventory reports of Agora Showroom Main', '01:11', '2025-09-23', 8),
(2231, 'Get the inventory reports of Agora Showroom Main', '01:11', '2025-09-23', 8),
(2232, 'Get the inventory reports of Agora Showroom Main', '01:11', '2025-09-23', 8),
(2233, 'Get the inventory reports of Warehouse CDO', '01:12', '2025-09-23', 9),
(2234, 'Get the inventory reports of Warehouse CDO', '01:12', '2025-09-23', 9),
(2235, 'Get the inventory reports of Warehouse CDO', '01:12', '2025-09-23', 9),
(2236, 'Get the inventory reports of Warehouse CDO', '01:12', '2025-09-23', 9),
(2237, 'Log Out', '01:41', '2025-09-23', 12),
(2238, 'Log Out', '01:41', '2025-09-23', 7),
(2239, 'Online', '17:02', '2025-09-23', 7),
(2240, 'Online', '17:45', '2025-09-23', 12),
(2241, 'Viewed installment management for Agora Showroom Main', '00:24', '2025-09-24', 12),
(2242, 'Viewed installment management for Agora Showroom Main', '00:24', '2025-09-24', 12),
(2243, 'Viewed installment management for Agora Showroom Main', '00:26', '2025-09-24', 12),
(2244, 'Viewed installment management for Agora Showroom Main', '00:26', '2025-09-24', 12),
(2245, 'Viewed installment management for Agora Showroom Main', '00:28', '2025-09-24', 12),
(2246, 'Viewed installment management for Agora Showroom Main', '00:31', '2025-09-24', 12),
(2247, 'Viewed installment management for Agora Showroom Main', '00:31', '2025-09-24', 12),
(2248, 'Viewed installment management for Agora Showroom Main', '00:36', '2025-09-24', 12),
(2249, 'Viewed installment management for Agora Showroom Main', '00:36', '2025-09-24', 12),
(2250, 'Viewed installment management for Agora Showroom Main', '00:40', '2025-09-24', 12),
(2251, 'Viewed installment management for Agora Showroom Main', '00:40', '2025-09-24', 12),
(2252, 'Viewed installment management for Agora Showroom Main', '00:43', '2025-09-24', 12),
(2253, 'Viewed installment management for Agora Showroom Main', '00:43', '2025-09-24', 12),
(2254, 'Viewed installment management for Agora Showroom Main', '00:47', '2025-09-24', 12),
(2255, 'Viewed installment management for Agora Showroom Main', '00:56', '2025-09-24', 12),
(2256, 'Viewed installment management for Agora Showroom Main', '00:56', '2025-09-24', 12),
(2257, 'Viewed installment management for Agora Showroom Main', '00:56', '2025-09-24', 12),
(2258, 'Viewed installment management for Agora Showroom Main', '01:00', '2025-09-24', 12),
(2259, 'Viewed installment management for Agora Showroom Main', '01:00', '2025-09-24', 12),
(2260, 'Viewed installment management for Agora Showroom Main', '01:01', '2025-09-24', 12),
(2261, 'Viewed installment management for Agora Showroom Main', '01:03', '2025-09-24', 12),
(2262, 'Viewed installment management for Agora Showroom Main', '01:03', '2025-09-24', 12),
(2263, 'Viewed installment management for Agora Showroom Main', '01:08', '2025-09-24', 12),
(2264, 'Viewed installment management for Agora Showroom Main', '01:09', '2025-09-24', 12),
(2265, 'Viewed installment management for Agora Showroom Main', '01:12', '2025-09-24', 12),
(2266, 'Viewed installment management for Agora Showroom Main', '01:12', '2025-09-24', 12),
(2267, 'Viewed installment management for Agora Showroom Main', '10:22', '2025-09-24', 12),
(2268, 'Viewed installment management for Agora Showroom Main', '10:22', '2025-09-24', 12),
(2269, 'Log Out', '10:28', '2025-09-24', 12),
(2270, 'Log Out', '10:28', '2025-09-24', 7),
(2271, 'Online', '10:32', '2025-09-24', 12),
(2272, 'Log Out', '10:32', '2025-09-24', 12),
(2273, 'Online', '10:33', '2025-09-24', 12),
(2274, 'Online', '10:47', '2025-09-24', 12),
(2275, 'Processed an installment sale at Agora Showroom Main, Invoice #82', '10:48', '2025-09-24', 12),
(2276, 'Viewed installment management for Agora Showroom Main', '10:49', '2025-09-24', 12),
(2277, 'Viewed installment management for Agora Showroom Main', '10:49', '2025-09-24', 12),
(2278, 'Viewed installment management for Agora Showroom Main', '10:49', '2025-09-24', 12),
(2279, 'Viewed installment management for Agora Showroom Main', '11:03', '2025-09-24', 12),
(2280, 'Viewed installment management for Agora Showroom Main', '11:03', '2025-09-24', 12),
(2281, 'Viewed installment management for Agora Showroom Main', '11:03', '2025-09-24', 12),
(2282, 'Viewed installment management for Agora Showroom Main', '11:07', '2025-09-24', 12),
(2283, 'Viewed installment management for Agora Showroom Main', '11:07', '2025-09-24', 12),
(2284, 'Processed an installment sale at Agora Showroom Main, Invoice #85', '11:07', '2025-09-24', 12),
(2285, 'Viewed installment management for Agora Showroom Main', '11:07', '2025-09-24', 12),
(2286, 'Viewed installment management for Agora Showroom Main', '11:07', '2025-09-24', 12),
(2287, 'Viewed installment management for Agora Showroom Main', '11:07', '2025-09-24', 12),
(2288, 'Viewed installment management for Agora Showroom Main', '11:07', '2025-09-24', 12),
(2289, 'Viewed installment management for Agora Showroom Main', '11:49', '2025-09-24', 12),
(2290, 'Viewed installment management for Agora Showroom Main', '11:49', '2025-09-24', 12),
(2291, 'Viewed installment management for Agora Showroom Main', '11:49', '2025-09-24', 12),
(2292, 'Viewed installment management for Agora Showroom Main', '13:09', '2025-09-24', 12),
(2293, 'Viewed installment management for Agora Showroom Main', '13:09', '2025-09-24', 12),
(2294, 'Processed an installment sale at Agora Showroom Main, Invoice #87', '13:10', '2025-09-24', 12),
(2295, 'Processed an installment sale at Agora Showroom Main, Invoice #88', '13:10', '2025-09-24', 12),
(2296, 'Viewed installment management for Agora Showroom Main', '13:11', '2025-09-24', 12),
(2297, 'Viewed installment management for Agora Showroom Main', '13:11', '2025-09-24', 12),
(2298, 'Viewed installment management for Agora Showroom Main', '13:11', '2025-09-24', 12),
(2299, 'Viewed installment management for Agora Showroom Main', '13:27', '2025-09-24', 12),
(2300, 'Viewed installment management for Agora Showroom Main', '13:27', '2025-09-24', 12),
(2301, 'Viewed installment management for Agora Showroom Main', '04:58', '2025-09-25', 12),
(2302, 'Viewed installment management for Agora Showroom Main', '04:58', '2025-09-25', 12),
(2303, 'Viewed installment management for Agora Showroom Main', '05:56', '2025-09-25', 12),
(2304, 'Viewed installment management for Agora Showroom Main', '05:56', '2025-09-25', 12),
(2305, 'Log Out', '06:07', '2025-09-25', 12),
(2306, 'Online', '06:08', '2025-09-25', 7),
(2307, 'Get the inventory reports of A.G-122 in null store', '10:05', '2025-09-25', 7),
(2308, 'Get the inventory reports of all locations', '10:05', '2025-09-25', 7),
(2309, 'Get the inventory reports of A.G-122 in null store', '10:46', '2025-09-25', 7),
(2310, 'Get the inventory reports of all locations', '10:59', '2025-09-25', 7),
(2311, 'Get the inventory reports of all locations', '10:59', '2025-09-25', 7),
(2312, 'Get the inventory reports of A.G-122 in null store', '11:09', '2025-09-25', 7),
(2313, 'Get the inventory reports of A.G-27 in null store', '11:10', '2025-09-25', 7),
(2314, 'Get the inventory reports of A.G-97 in null store', '11:13', '2025-09-25', 7),
(2315, 'Get the inventory reports of A.G-116 in null store', '11:13', '2025-09-25', 7),
(2316, 'Get the inventory reports of A.G-122 in null store', '11:17', '2025-09-25', 7),
(2317, 'Get the inventory reports of A.G-122 in null store', '11:18', '2025-09-25', 7),
(2318, 'Get the inventory reports of A.G-97 in null store', '11:19', '2025-09-25', 7),
(2319, 'Get the inventory reports of A.G-97 in null store', '11:19', '2025-09-25', 7),
(2320, 'Get the inventory reports of A.G-103 in null store', '11:22', '2025-09-25', 7),
(2321, 'Get the inventory reports of A.G-27 in null store', '11:29', '2025-09-25', 7),
(2322, 'Get the inventory reports of all locations', '13:12', '2025-09-25', 7),
(2323, 'Get the inventory reports of A.G-122 in null store', '13:12', '2025-09-25', 7),
(2324, 'Get the inventory reports of all locations', '13:12', '2025-09-25', 7),
(2325, 'Online', '13:16', '2025-09-25', 16),
(2326, 'Processed a customer sale at Jasaan Showroom, Invoice #94', '13:17', '2025-09-25', 16),
(2327, 'Log Out', '13:40', '2025-09-25', 12),
(2328, 'Log Out', '13:40', '2025-09-25', 7),
(2329, 'Log Out', '13:40', '2025-09-25', 16),
(2330, 'Online', '14:00', '2025-09-25', 12),
(2331, 'Online', '14:01', '2025-09-25', 8),
(2332, 'Track the request #62', '14:01', '2025-09-25', 8),
(2333, 'Get the inventory reports of Agora Showroom Main', '14:05', '2025-09-25', 8),
(2334, 'Get the inventory reports of Agora Showroom Main', '14:05', '2025-09-25', 8),
(2335, 'Get the inventory reports of Agora Showroom Main', '14:05', '2025-09-25', 8),
(2336, 'Get the inventory reports of Agora Showroom Main', '14:05', '2025-09-25', 8),
(2337, 'Online', '14:05', '2025-09-25', 7),
(2338, 'Log Out', '09:12', '2025-09-26', 8),
(2339, 'Online', '09:13', '2025-09-26', 12),
(2340, 'Online', '18:36', '2025-09-26', 7),
(2341, 'Log Out', '20:54', '2025-09-26', 12),
(2342, 'Online', '20:56', '2025-08-26', 12),
(2343, 'Processed an installment sale at Agora Showroom Main, Invoice #102', '20:58', '2025-08-26', 12),
(2344, 'Log Out', '21:39', '2025-09-26', 12),
(2345, 'Online', '21:39', '2025-09-26', 12),
(2346, 'Online', '22:17', '2025-09-27', 7),
(2347, 'Online', '22:17', '2025-09-27', 7),
(2348, 'Online', '22:17', '2025-09-27', 7),
(2349, 'Log Out', '22:32', '2025-09-29', 7),
(2350, 'Online', '22:33', '2025-09-29', 7),
(2351, 'Online', '22:39', '2025-09-30', 12),
(2352, 'Viewed installment management for Agora Showroom Main', '23:48', '2025-09-26', 12),
(2353, 'Viewed installment management for Agora Showroom Main', '23:48', '2025-09-26', 12),
(2354, 'Viewed installment management for Agora Showroom Main', '23:49', '2025-09-26', 12),
(2355, 'Log Out', '00:04', '2025-09-27', 7),
(2356, 'Log Out', '00:04', '2025-09-27', 12),
(2357, 'Online', '08:09', '2025-09-29', 9),
(2358, 'Log Out', '08:09', '2025-09-29', 9),
(2359, 'Online', '08:09', '2025-09-29', 12),
(2360, 'Log Out', '08:10', '2025-09-29', 12),
(2361, 'Online', '08:10', '2025-09-29', 7),
(2362, 'Online', '08:13', '2025-09-29', 12),
(2363, 'Processed an installment sale at Agora Showroom Main, Invoice #104', '08:19', '2025-09-29', 12),
(2364, 'Log Out', '08:24', '2025-09-29', 12),
(2365, 'Online', '08:24', '2025-09-29', 8),
(2366, 'Get the inventory reports of Agora Showroom Main', '08:25', '2025-09-29', 8),
(2367, 'Get the inventory reports of Agora Showroom Main', '08:25', '2025-09-29', 8),
(2368, 'Get the inventory reports of Agora Showroom Main', '08:25', '2025-09-29', 8),
(2369, 'Get the inventory reports of Agora Showroom Main', '08:25', '2025-09-29', 8),
(2370, 'Get the inventory reports of A.G-18 in Agora Showroom Main store', '08:30', '2025-09-29', 8),
(2371, 'Get the inventory reports of Agora Showroom Main', '08:31', '2025-09-29', 8),
(2372, 'Get the inventory reports of Agora Showroom Main', '08:31', '2025-09-29', 8),
(2373, 'Get the inventory reports of Agora Showroom Main', '08:31', '2025-09-29', 8),
(2374, 'Get the inventory reports of Agora Showroom Main', '08:31', '2025-09-29', 8),
(2375, 'Log Out', '08:31', '2025-09-29', 8),
(2376, 'Online', '08:31', '2025-09-29', 9),
(2377, 'Online', '08:35', '2025-09-29', 9);

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE `branch` (
  `branch_id` int(50) NOT NULL,
  `branch_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branch`
--

INSERT INTO `branch` (`branch_id`, `branch_name`) VALUES
(1, 'CDO BRANCH'),
(2, 'JASAAN BRANCH');

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `category_id` int(50) NOT NULL,
  `category_name` varchar(50) NOT NULL,
  `category_description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`category_id`, `category_name`, `category_description`) VALUES
(9, 'Furniture', 'Furniture products like sofa, table, bed etc.'),
(10, 'Supplies', 'Product that is ell like kitchen supplies school supplies and etc.');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `cust_id` int(50) NOT NULL,
  `cust_name` varchar(50) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `address` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`cust_id`, `cust_name`, `phone`, `email`, `address`) VALUES
(1, 'John Renein ', '2', 'johnrenein@gmailcom', 'Canitoan'),
(2, 'Claire Ivy Arcay', '3', 'claire@gmail.com', 'Canitoan'),
(3, 'Angelica Engelbrecht', '04', 'angelicasss@gmail.com', 'mabuaya zonerooks\n'),
(4, 'Neneth Maristela', '09354152202', 'nnmaristela@gmail.com', 'Manila'),
(5, 'Christian Valle', '09111111111', 'chan@gmail.com', 'Macabalan');

-- --------------------------------------------------------

--
-- Table structure for table `customer_accounts`
--

CREATE TABLE `customer_accounts` (
  `cust_account_id` int(50) NOT NULL,
  `cust_username` varchar(50) NOT NULL,
  `cust_password` varchar(50) NOT NULL,
  `fname` varchar(50) NOT NULL,
  `mname` varchar(50) NOT NULL,
  `lname` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `phone` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_cart`
--

CREATE TABLE `customer_cart` (
  `c_cart_id` int(50) NOT NULL,
  `cust_account_id` int(50) NOT NULL,
  `product_id` int(50) NOT NULL,
  `price` int(5) NOT NULL,
  `qty` int(50) NOT NULL,
  `session_id` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_sales`
--

CREATE TABLE `customer_sales` (
  `customer_sales_id` int(11) NOT NULL,
  `invoice_id` int(10) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL,
  `final_total_amount` decimal(10,2) NOT NULL,
  `total_qty` int(10) NOT NULL,
  `payment_method` varchar(100) NOT NULL,
  `payment_status` varchar(100) NOT NULL,
  `discount_percentage` int(10) NOT NULL,
  `cust_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_sales`
--

INSERT INTO `customer_sales` (`customer_sales_id`, `invoice_id`, `total_amount`, `discount`, `final_total_amount`, `total_qty`, `payment_method`, `payment_status`, `discount_percentage`, `cust_id`) VALUES
(1, 20, 25500.00, 7652.55, 17847.45, 1, 'cash', 'Paid', 30, 1),
(2, 21, 25500.00, 0.00, 25500.00, 1, 'cash', 'Paid', 0, 1),
(3, 25, 64600.00, 19367.08, 45232.92, 2, 'cash', 'Paid', 30, 3),
(4, 27, 29700.00, 8910.00, 20790.00, 1, 'cash', 'Paid', 30, 2),
(5, 29, 25500.00, 7650.00, 17850.00, 1, 'cash', 'Paid', 30, 1),
(6, 34, 29700.00, 8910.00, 20790.00, 1, 'cash', 'Paid', 30, 3),
(7, 35, 25500.00, 7650.00, 17850.00, 1, 'cash', 'Paid', 30, 3),
(8, 36, 32300.00, 9690.00, 22610.00, 1, 'cash', 'Paid', 30, 3),
(9, 38, 32300.00, 0.00, 32300.00, 1, 'cash', 'Paid', 0, 3),
(10, 39, 57800.00, 17340.00, 40460.00, 2, 'cash', 'Paid', 30, 3),
(11, 94, 25500.00, 7650.00, 17850.00, 1, 'cash', 'Paid', 30, 5);

-- --------------------------------------------------------

--
-- Table structure for table `customer_sales_details`
--

CREATE TABLE `customer_sales_details` (
  `c_sale_details` int(11) NOT NULL,
  `customer_sales_id` int(10) NOT NULL,
  `product_id` int(10) NOT NULL,
  `qty` int(10) NOT NULL,
  `price_per_qty` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_sales_details`
--

INSERT INTO `customer_sales_details` (`c_sale_details`, `customer_sales_id`, `product_id`, `qty`, `price_per_qty`, `total_price`) VALUES
(1, 1, 43, 1, 25500.00, 25500.00),
(2, 2, 43, 1, 25500.00, 25500.00),
(3, 3, 63, 2, 32300.00, 64600.00),
(4, 4, 19, 1, 29700.00, 29700.00),
(5, 5, 43, 1, 25500.00, 25500.00),
(6, 6, 21, 1, 29700.00, 29700.00),
(7, 7, 43, 1, 25500.00, 25500.00),
(8, 8, 63, 1, 32300.00, 32300.00),
(9, 9, 63, 1, 32300.00, 32300.00),
(10, 10, 63, 1, 32300.00, 32300.00),
(11, 10, 43, 1, 25500.00, 25500.00),
(12, 11, 43, 1, 25500.00, 25500.00);

-- --------------------------------------------------------

--
-- Table structure for table `customized_product`
--

CREATE TABLE `customized_product` (
  `customized_id` int(50) NOT NULL,
  `customized_req_id` int(50) NOT NULL,
  `price_adjustment` int(50) NOT NULL,
  `total_price` int(50) NOT NULL,
  `status` varchar(50) NOT NULL,
  `creation_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customized_product_pricing`
--

CREATE TABLE `customized_product_pricing` (
  `cpp_id` int(50) NOT NULL,
  `customized_req_id` int(50) NOT NULL,
  `price_adjustment` int(50) NOT NULL,
  `total_price` int(50) NOT NULL,
  `time` int(6) NOT NULL,
  `date` int(6) NOT NULL,
  `account_id` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customized_product_request`
--

CREATE TABLE `customized_product_request` (
  `customized_req_id` int(50) NOT NULL,
  `cust_account_id` int(50) NOT NULL,
  `base_product_id` int(50) NOT NULL,
  `custome_details` varchar(1000) NOT NULL,
  `customized_product_image` varchar(50) NOT NULL,
  `time` time(6) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customized_product_update`
--

CREATE TABLE `customized_product_update` (
  `cpu_id` int(50) NOT NULL,
  `customized_id` int(50) NOT NULL,
  `description` int(50) NOT NULL,
  `date` date NOT NULL,
  `time` time(6) NOT NULL,
  `account_id` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `delivery_charge`
--

CREATE TABLE `delivery_charge` (
  `dc_id` int(50) NOT NULL,
  `location` varchar(50) NOT NULL,
  `rate` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `delivery_details`
--

CREATE TABLE `delivery_details` (
  `delivery_id` int(50) NOT NULL,
  `plate_number` int(50) NOT NULL,
  `time` time(6) NOT NULL,
  `date` date NOT NULL,
  `status` varchar(50) NOT NULL,
  `dc_id` int(50) NOT NULL,
  `Delivery_Charge` int(50) NOT NULL,
  `account_id` int(50) NOT NULL,
  `sales_id` int(50) NOT NULL,
  `exchange_id` int(50) NOT NULL,
  `date_delivered` date NOT NULL,
  `time_delivered` time(6) NOT NULL,
  `location_id` int(50) NOT NULL,
  `delivery_location` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deliver_transfer`
--

CREATE TABLE `deliver_transfer` (
  `dt_id` int(100) NOT NULL,
  `ts_id` int(100) NOT NULL,
  `date` date NOT NULL,
  `delivery_status` varchar(100) NOT NULL,
  `account_id` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exchange_item`
--

CREATE TABLE `exchange_item` (
  `exchange_id` int(50) NOT NULL,
  `sales_id` int(50) NOT NULL,
  `reason` varchar(1000) NOT NULL,
  `date` date NOT NULL,
  `time` time(6) NOT NULL,
  `status` varchar(50) NOT NULL,
  `delivery_options` varchar(50) NOT NULL,
  `location_id` int(50) NOT NULL,
  `account_id` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exchange_item_details`
--

CREATE TABLE `exchange_item_details` (
  `exchange_details_id` int(50) NOT NULL,
  `exchange_id` int(50) NOT NULL,
  `original_product_id` int(50) NOT NULL,
  `new_product_id` int(50) NOT NULL,
  `price_diff` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guest`
--

CREATE TABLE `guest` (
  `session_id` int(50) NOT NULL,
  `created_at` varchar(50) NOT NULL,
  `expire_at` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `installment_payment_record`
--

CREATE TABLE `installment_payment_record` (
  `ipr_id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `ips_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `installment_payment_record`
--

INSERT INTO `installment_payment_record` (`ipr_id`, `invoice_id`, `ips_id`, `date`, `time`) VALUES
(18, 83, 70, '2025-09-24', '10:49'),
(19, 83, 71, '2025-09-24', '10:49'),
(20, 84, 64, '2025-09-24', '11:03'),
(21, 86, 72, '2025-09-24', '11:49'),
(22, 86, 73, '2025-09-24', '11:49'),
(23, 86, 74, '2025-09-24', '11:49'),
(24, 86, 75, '2025-09-24', '11:49'),
(25, 89, 79, '2025-09-24', '13:11'),
(28, 91, 80, '2025-09-25', '05:50'),
(29, 92, 81, '2025-09-25', '05:52'),
(30, 93, 82, '2025-09-25', '05:52'),
(31, 95, 76, '2025-09-26', '10:13'),
(32, 95, 77, '2025-09-26', '10:13'),
(33, 95, 78, '2025-09-26', '10:13'),
(34, 96, 83, '2025-09-26', '10:14'),
(35, 103, 65, '2025-09-26', '23:49'),
(36, 105, 91, '2025-09-29', '08:19');

-- --------------------------------------------------------

--
-- Table structure for table `installment_payment_sched`
--

CREATE TABLE `installment_payment_sched` (
  `ips_id` int(11) NOT NULL,
  `installment_id` int(11) NOT NULL,
  `due_date` date NOT NULL,
  `payment_number` int(11) NOT NULL,
  `amount_due` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `installment_payment_sched`
--

INSERT INTO `installment_payment_sched` (`ips_id`, `installment_id`, `due_date`, `payment_number`, `amount_due`, `status`) VALUES
(64, 13, '2025-06-05', 1, 3000.00, 'Paid'),
(65, 13, '2025-07-05', 2, 3000.00, 'Paid'),
(66, 13, '2025-08-05', 3, 3000.00, 'UNPAID'),
(67, 13, '2025-09-05', 4, 3000.00, 'UNPAID'),
(68, 13, '2025-10-05', 5, 3000.00, 'UNPAID'),
(69, 13, '2025-11-05', 6, 3000.00, 'UNPAID'),
(70, 14, '2025-10-24', 1, 6900.00, 'Paid'),
(71, 14, '2025-11-24', 2, 6900.00, 'Paid'),
(72, 14, '2025-12-24', 3, 6900.00, 'Paid'),
(73, 14, '2026-01-24', 4, 6900.00, 'Paid'),
(74, 14, '2026-02-24', 5, 6900.00, 'Paid'),
(75, 14, '2026-03-24', 6, 6900.00, 'Paid'),
(76, 15, '2025-10-24', 1, 12373.33, 'Paid'),
(77, 15, '2025-11-24', 2, 12373.33, 'Paid'),
(78, 15, '2025-12-24', 3, 12373.33, 'Paid'),
(79, 16, '2025-10-24', 1, 11333.33, 'Paid'),
(80, 16, '2025-11-24', 2, 11333.33, 'Paid'),
(81, 16, '2025-12-24', 3, 11333.33, 'Paid'),
(82, 17, '2025-10-24', 1, 4752.00, 'Paid'),
(83, 17, '2025-11-24', 2, 4752.00, 'Paid'),
(84, 17, '2025-12-24', 3, 4752.00, 'UNPAID'),
(85, 17, '2026-01-24', 4, 4752.00, 'UNPAID'),
(86, 17, '2026-02-24', 5, 4752.00, 'UNPAID'),
(87, 17, '2026-03-24', 6, 4752.00, 'UNPAID'),
(88, 18, '2025-09-26', 1, 7333.33, 'UNPAID'),
(89, 18, '2025-10-26', 2, 7333.33, 'UNPAID'),
(90, 18, '2025-11-26', 3, 7333.33, 'UNPAID'),
(91, 19, '2025-10-29', 1, 3856.67, 'Paid'),
(92, 19, '2025-11-29', 2, 3856.67, 'UNPAID'),
(93, 19, '2025-12-29', 3, 3856.67, 'UNPAID'),
(94, 19, '2026-01-29', 4, 3856.67, 'UNPAID'),
(95, 19, '2026-03-01', 5, 3856.67, 'UNPAID'),
(96, 19, '2026-03-29', 6, 3856.67, 'UNPAID'),
(97, 19, '2026-04-29', 7, 3856.67, 'UNPAID'),
(98, 19, '2026-05-29', 8, 3856.67, 'UNPAID'),
(99, 19, '2026-06-29', 9, 3856.67, 'UNPAID'),
(100, 19, '2026-07-29', 10, 3856.67, 'UNPAID'),
(101, 19, '2026-08-29', 11, 3856.67, 'UNPAID'),
(102, 19, '2026-09-29', 12, 3856.67, 'UNPAID');

-- --------------------------------------------------------

--
-- Table structure for table `installment_sales`
--

CREATE TABLE `installment_sales` (
  `installment_sales_id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `dp_amount` decimal(10,2) NOT NULL,
  `dp_percentage` int(10) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `interest_percentage` int(100) NOT NULL,
  `interest_amount` decimal(10,2) NOT NULL,
  `remaining_bal` decimal(10,2) NOT NULL,
  `total_payment` decimal(10,2) NOT NULL,
  `payment_plan` varchar(10) NOT NULL,
  `total_sales_amount` decimal(10,2) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `monthly_payment` decimal(10,2) NOT NULL,
  `cust_id` int(100) NOT NULL,
  `status` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `installment_sales`
--

INSERT INTO `installment_sales` (`installment_sales_id`, `invoice_id`, `product_id`, `dp_amount`, `dp_percentage`, `total_amount`, `interest_percentage`, `interest_amount`, `remaining_bal`, `total_payment`, `payment_plan`, `total_sales_amount`, `balance`, `monthly_payment`, `cust_id`, `status`) VALUES
(13, 54, 19, 10000.00, 34, 0.00, 0, 0.00, 0.00, 0.00, '6', 0.00, 12000.00, 3000.00, 4, 'On Going'),
(14, 82, 0, 10000.00, 22, 44500.00, 20, 6900.00, 34500.00, 41400.00, '6', 51400.00, 0.00, 6900.00, 1, 'Complete'),
(15, 85, 0, 9280.00, 20, 46400.00, 0, 0.00, 37120.00, 37120.00, '3', 46400.00, 0.00, 12373.33, 1, 'Complete'),
(16, 87, 0, 8500.00, 20, 42500.00, 0, 0.00, 34000.00, 34000.00, '3', 42500.00, 0.00, 11333.33, 3, 'Complete'),
(17, 88, 0, 5940.00, 20, 29700.00, 20, 4752.00, 23760.00, 28512.00, '6', 34452.00, 19008.00, 4752.00, 3, 'ON GOING'),
(18, 102, 0, 5500.00, 20, 27500.00, 0, 0.00, 22000.00, 22000.00, '3', 27500.00, 22000.00, 7333.33, 5, 'ON GOING'),
(19, 104, 0, 8900.00, 20, 44500.00, 30, 10680.00, 35600.00, 46280.00, '12', 55180.00, 42423.37, 3856.67, 2, 'ON GOING');

-- --------------------------------------------------------

--
-- Table structure for table `invoice`
--

CREATE TABLE `invoice` (
  `invoice_id` int(11) NOT NULL,
  `sales_from` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `time` varchar(10) NOT NULL,
  `location_id` int(10) NOT NULL,
  `account_id` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice`
--

INSERT INTO `invoice` (`invoice_id`, `sales_from`, `amount`, `date`, `time`, `location_id`, `account_id`) VALUES
(8, 'Walk-In Sales', 27500.00, '2025-08-27', '21:14', 12, 12),
(9, 'Walk-In Sales', 17850.00, '2025-08-27', '21:32', 12, 12),
(13, 'Walk-In Sales', 19250.00, '2025-08-30', '21:51', 12, 12),
(15, 'Walk-In Sales', 41580.00, '2025-08-31', '20:04', 12, 12),
(16, 'Walk-In Sales', 22610.00, '2025-08-31', '20:18', 12, 12),
(20, 'Customer Sales', 17847.45, '2025-08-31', '20:26', 12, 12),
(21, 'Customer Sales', 25500.00, '2025-09-02', '08:06', 12, 12),
(22, 'Walk-In Sales', 19250.00, '2025-09-02', '08:15', 12, 12),
(23, 'Walk-In Sales', 23380.00, '2025-09-02', '08:24', 12, 12),
(24, 'Walk-In Sales', 40040.00, '2025-09-02', '12:49', 12, 12),
(25, 'Customer Sales', 45232.92, '2025-09-02', '14:32', 12, 12),
(26, 'Walk-In Sales', 20790.00, '2025-09-02', '14:34', 12, 12),
(27, 'Customer Sales', 20790.00, '2025-09-02', '17:58', 12, 12),
(28, 'Walk-In Sales', 19250.00, '2025-09-03', '10:16', 12, 12),
(29, 'Customer Sales', 17850.00, '2025-09-03', '10:20', 12, 12),
(30, 'Walk-In Sales', 20790.00, '2025-09-03', '10:42', 12, 12),
(31, 'Walk-In Sales', 20790.00, '2025-09-03', '10:45', 12, 12),
(33, 'Walk-In Sales', 38500.00, '2025-09-03', '11:35', 12, 12),
(34, 'Customer Sales', 20790.00, '2025-09-03', '14:41', 12, 12),
(35, 'Customer Sales', 17850.00, '2025-09-03', '21:43', 12, 12),
(36, 'Customer Sales', 22610.00, '2025-09-03', '22:02', 12, 12),
(37, 'Walk-In Sales', 40460.00, '2025-09-03', '22:04', 12, 12),
(38, 'Customer Sales', 32300.00, '2025-09-03', '22:14', 12, 12),
(39, 'Customer Sales', 40460.00, '2025-09-04', '02:51', 12, 12),
(40, 'Walk-In Sales', 17850.00, '2025-09-04', '03:17', 12, 12),
(43, 'Installment Downpayment', 8340.00, '2025-09-05', '14:42', 12, 12),
(44, 'Installment Downpayment', 5100.00, '2025-09-05', '15:15', 12, 12),
(45, 'Installment Downpayment', 6460.00, '2025-09-05', '15:26', 12, 12),
(46, 'Installment Downpayment', 8900.00, '2025-09-05', '15:40', 12, 12),
(47, 'Installment Downpayment', 7700.00, '2025-09-05', '23:41', 12, 12),
(48, 'Installment Downpayment', 11980.00, '2025-09-05', '23:53', 12, 12),
(49, 'Installment Downpayment', 5100.00, '2025-09-06', '00:01', 12, 12),
(50, 'Installment Downpayment', 7700.00, '2025-09-07', '01:14', 12, 12),
(51, 'Installment Downpayment', 10000.00, '2025-09-11', '12:49', 12, 12),
(52, 'Installment Downpayment', 5500.00, '2025-09-14', '06:25', 14, 16),
(53, 'Walk-In Sales', 500000.00, '2024-06-27', '10:30', 12, 12),
(54, 'Installment Downpayment', 10000.00, '2024-06-29', '11:00', 12, 12),
(55, 'Installment Payment', 13344.00, '2025-09-18', '07:11', 12, 12),
(56, 'Installment Payment', 2040.00, '2025-09-18', '07:38', 12, 12),
(57, 'Installment Payment', 3150.00, '2025-09-18', '15:02', 12, 12),
(58, 'Installment Payment', 3150.00, '2025-09-18', '15:03', 12, 12),
(59, 'Installment Payment', 6672.00, '2025-09-18', '23:31', 12, 12),
(60, 'Installment Payment', 6800.00, '2025-09-18', '23:33', 12, 12),
(61, 'Installment Payment', 17226.66, '2025-09-18', '23:35', 12, 12),
(64, 'Installment Payment', 9584.00, '2025-09-24', '00:28', 12, 12),
(72, 'Installment Payment', 6672.00, '2025-09-24', '00:47', 12, 12),
(75, 'Installment Payment', 6672.00, '2025-09-24', '00:56', 12, 12),
(76, 'Installment Payment', 21360.00, '2025-09-24', '01:01', 12, 12),
(77, 'Installment Payment', 7120.00, '2025-09-24', '01:03', 12, 12),
(78, 'Installment Payment', 2040.00, '2025-09-24', '01:03', 12, 12),
(80, 'Installment Payment', 6160.00, '2025-09-24', '01:08', 12, 12),
(81, 'Installment Payment', 12320.00, '2025-09-24', '01:09', 12, 12),
(82, 'Installment Downpayment', 10000.00, '2025-09-24', '10:48', 12, 12),
(83, 'Installment Payment', 13800.00, '2025-09-24', '10:49', 12, 12),
(84, 'Installment Payment', 3150.00, '2025-09-24', '11:03', 12, 12),
(85, 'Installment Downpayment', 9280.00, '2025-09-24', '11:07', 12, 12),
(86, 'Installment Payment', 27600.00, '2025-09-24', '11:49', 12, 12),
(87, 'Installment Downpayment', 8500.00, '2025-09-24', '13:10', 12, 12),
(88, 'Installment Downpayment', 5940.00, '2025-09-24', '13:10', 12, 12),
(89, 'Installment Payment', 11333.33, '2025-09-24', '13:11', 12, 12),
(91, 'Installment Payment', 11333.33, '2025-09-25', '05:50', 12, 12),
(92, 'Installment Payment', 11333.33, '2025-09-25', '05:52', 12, 12),
(93, 'Installment Payment', 4752.00, '2025-09-25', '05:52', 12, 12),
(94, 'Customer Sales', 17850.00, '2025-09-25', '13:17', 14, 16),
(95, 'Installment Payment', 37119.99, '2025-09-26', '10:13', 12, 12),
(96, 'Installment Payment', 4752.00, '2025-09-26', '10:14', 12, 12),
(97, 'Walk-In Sales', 200000.00, '2026-01-10', '10:30', 12, 7),
(98, 'Walk-In Sales', 300000.00, '2027-01-20', '10:30', 12, 7),
(102, 'Installment Downpayment', 5500.00, '2025-08-26', '20:58', 12, 12),
(103, 'Installment Payment', 3150.00, '2025-09-26', '23:49', 12, 12),
(104, 'Installment Downpayment', 8900.00, '2025-09-29', '08:19', 12, 12),
(105, 'Installment Payment', 3856.67, '2025-09-29', '08:19', 12, 12);

-- --------------------------------------------------------

--
-- Table structure for table `invoice_details`
--

CREATE TABLE `invoice_details` (
  `invoice_details_id` int(11) NOT NULL,
  `invoice_id` int(100) NOT NULL,
  `product_id` int(100) NOT NULL,
  `qty` int(10) NOT NULL,
  `price_per_qty` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice_details`
--

INSERT INTO `invoice_details` (`invoice_details_id`, `invoice_id`, `product_id`, `qty`, `price_per_qty`, `total_price`) VALUES
(1, 33, 47, 2, 27500.00, 55000.00),
(2, 34, 21, 1, 29700.00, 29700.00),
(3, 35, 43, 1, 25500.00, 25500.00),
(4, 36, 63, 1, 32300.00, 32300.00),
(5, 37, 43, 1, 25500.00, 25500.00),
(6, 37, 63, 1, 32300.00, 32300.00),
(7, 38, 63, 1, 32300.00, 32300.00),
(8, 39, 63, 1, 32300.00, 32300.00),
(9, 39, 43, 1, 25500.00, 25500.00),
(10, 40, 43, 1, 25500.00, 25500.00),
(13, 43, 48, 1, 41700.00, 41700.00),
(14, 44, 43, 1, 25500.00, 25500.00),
(15, 45, 63, 1, 32300.00, 32300.00),
(16, 46, 69, 1, 44500.00, 44500.00),
(17, 47, 52, 1, 38500.00, 38500.00),
(18, 48, 70, 1, 59900.00, 59900.00),
(19, 49, 43, 1, 25500.00, 25500.00),
(20, 50, 52, 1, 38500.00, 38500.00),
(21, 51, 64, 1, 45000.00, 45000.00),
(22, 52, 47, 1, 27500.00, 27500.00),
(23, 54, 19, 1, 29700.00, 29700.00),
(24, 82, 69, 1, 44500.00, 44500.00),
(25, 85, 50, 1, 46400.00, 46400.00),
(26, 87, 68, 1, 42500.00, 42500.00),
(27, 88, 21, 1, 29700.00, 29700.00),
(28, 94, 43, 1, 25500.00, 25500.00),
(29, 102, 47, 1, 27500.00, 27500.00),
(30, 104, 69, 1, 44500.00, 44500.00);

-- --------------------------------------------------------

--
-- Table structure for table `location`
--

CREATE TABLE `location` (
  `location_id` int(50) NOT NULL,
  `location_name` varchar(300) NOT NULL,
  `contact_person` varchar(100) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `address` varchar(50) NOT NULL,
  `branch_id` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `location`
--

INSERT INTO `location` (`location_id`, `location_name`, `contact_person`, `phone`, `email`, `address`, `branch_id`) VALUES
(12, 'Agora Showroom Main', 'Lyca Cantilado', '09', 'lyba.cantilado.coc@phinmaed.com', 'Ylaya Carmen CDO City', 1),
(13, 'Warehouse CDO', 'Christian Butaya', '09', 'chco.butaya.coc@phinmaed.com', 'Bonbon CDO City', 1),
(14, 'Jasaan Showroom', 'tester location', '012345', 'testlocation@gmail.com', 'Jasaan Kahulugan Crossing', 2);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(50) NOT NULL,
  `product_name` varchar(50) NOT NULL,
  `category_id` int(50) NOT NULL,
  `description` varchar(500) NOT NULL,
  `dimensions` varchar(50) NOT NULL,
  `material` varchar(1000) NOT NULL,
  `color` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `product_preview_image` varchar(50) NOT NULL,
  `date_created` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `product_name`, `category_id`, `description`, `dimensions`, `material`, `color`, `price`, `product_preview_image`, `date_created`) VALUES
(19, 'A.G-71', 9, 'Checkered L-type', '', '', 'Gray', 29700.00, '/uploads/products/defualt.jpg\r\n', '2025-07-23'),
(20, 'A.G-42', 9, 'Checkered', '', '', 'Blue', 33400.00, '/uploads/products/defualt.jpg\r\n', '2025-07-23'),
(21, 'A.G-27', 9, '311 - 1 three seater couch and 2  one seater couch ', '', '', 'Dark Gray', 29700.00, '/uploads/products/product_1759104707087.JPG', '2025-07-29'),
(43, 'A.G-53', 9, '311 - 1 three seater couch and 2 one seater couch with buttons ', '', '', 'Gray', 25500.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(44, 'A.G-103', 9, 'Cleopatra', '', '', 'Red', 28300.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(45, 'A.G-29', 9, 'Hallow', '', '', 'Gray', 28500.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(46, 'A.G-96', 9, 'With Buttons 311', '', '', 'Gray', 33800.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(47, 'A.G-122', 9, '211 - 1 two seater couch and 2 one seater couch standard ', '1', '', 'Gray', 27500.00, '/uploads/products/product_1758752672637.JPG', '2025-07-29'),
(48, 'A.G-5', 9, 'High End Sofa Single', '', '', 'Brown', 41700.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(49, 'A.G-137', 9, 'L-Type', '', '', 'Red', 29700.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(50, 'A.G-46', 9, 'High End Sofa With Buttons', '', '', 'Black', 46400.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(51, 'A.G-132', 9, 'standard KGI/Cream With Buttons', '', '', 'Brown', 38900.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(52, 'A.G-143', 9, 'Checkered Standard With Buttons', '', '', 'Gray', 38500.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(63, 'A.G-141', 9, '311 - 1 three seater couch and 2 one seater couch, off white ', '', '', 'White', 32300.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(64, 'A.G-140', 9, 'Small U-type', '', '', 'Blue', 45000.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(65, 'A.G-1', 9, 'Standard', '', '', 'Gray ', 38900.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(66, 'A.G-152', 9, 'L-type High End', '', '', 'Gray', 43700.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(67, 'A.G-97', 9, 'Cushion', '', '', 'Blue', 54300.00, '/uploads/products/defualt.jpg\r\n', ''),
(68, 'A.G-18', 9, 'Checkered Standard', '', '', 'Black', 42500.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(69, 'A.G-116', 9, 'Conor w/ Buttons', '', '', 'Cream', 44500.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(70, 'A.G-119', 9, 'L-type ', '', '', 'Brown', 59900.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(71, 'A.G-52', 9, 'L-type', '', '', 'Red', 35300.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(72, 'A.G-49', 9, 'L-type With Buttons ', '', '', 'Brown', 35400.00, '/uploads/products/defualt.jpg\r\n', '2025-07-29'),
(74, 'ad', 9, 'dada', 'ad', 'dsada', 'dad', 1.00, '/uploads/products/defualt.jpg\r\n', '2025-09-21');

-- --------------------------------------------------------

--
-- Table structure for table `request_approved`
--

CREATE TABLE `request_approved` (
  `request_approved_id` int(20) NOT NULL,
  `request_stock_id` int(20) NOT NULL,
  `approved_by` int(20) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `request_approved`
--

INSERT INTO `request_approved` (`request_approved_id`, `request_stock_id`, `approved_by`, `date`) VALUES
(55, 59, 9, '2025-08-12'),
(56, 60, 9, '2025-08-13'),
(57, 58, 9, '2025-08-13'),
(58, 61, 9, '2025-08-13'),
(59, 64, 14, '2025-08-13'),
(60, 65, 14, '2025-08-13'),
(61, 66, 14, '2025-08-13'),
(62, 67, 14, '2025-08-13'),
(63, 68, 14, '2025-08-13'),
(64, 69, 14, '2025-08-13'),
(65, 70, 14, '2025-08-13'),
(66, 71, 14, '2025-08-13'),
(67, 62, 9, '2025-08-13'),
(68, 72, 14, '2025-08-13'),
(69, 63, 14, '2025-08-13'),
(70, 73, 14, '2025-08-13'),
(71, 75, 9, '2025-08-13'),
(72, 77, 9, '2025-08-14'),
(73, 78, 9, '2025-08-14'),
(74, 80, 9, '2025-08-14'),
(75, 79, 9, '2025-08-14'),
(76, 82, 9, '2025-08-18'),
(77, 83, 9, '2025-08-18'),
(78, 81, 9, '2025-08-18'),
(79, 74, 9, '2025-08-18'),
(80, 87, 9, '2025-08-19'),
(81, 86, 9, '2025-08-19'),
(82, 85, 9, '2025-08-19'),
(83, 84, 9, '2025-08-19'),
(84, 90, 9, '2025-08-21'),
(85, 91, 9, '2025-08-21'),
(86, 92, 9, '2025-08-21'),
(87, 93, 9, '2025-08-21'),
(88, 88, 9, '2025-08-21'),
(89, 94, 9, '2025-08-21'),
(90, 96, 9, '2025-08-23'),
(91, 96, 9, '2025-08-23'),
(92, 96, 9, '2025-08-23'),
(93, 96, 9, '2025-08-23'),
(94, 96, 9, '2025-08-23'),
(95, 96, 9, '2025-08-23'),
(96, 96, 9, '2025-08-23'),
(97, 96, 9, '2025-08-23'),
(98, 97, 9, '2025-08-27'),
(99, 89, 9, '2025-09-02'),
(100, 95, 9, '2025-09-02'),
(101, 98, 9, '2025-09-02'),
(102, 99, 9, '2025-09-02'),
(103, 100, 9, '2025-09-03'),
(104, 102, 9, '2025-09-11'),
(105, 103, 9, '2025-09-14'),
(106, 104, 9, '2025-09-14');

-- --------------------------------------------------------

--
-- Table structure for table `request_deliver`
--

CREATE TABLE `request_deliver` (
  `r_deliver_id` int(11) NOT NULL,
  `request_stock_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `delivery_status` varchar(255) NOT NULL,
  `account_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `request_deliver`
--

INSERT INTO `request_deliver` (`r_deliver_id`, `request_stock_id`, `date`, `delivery_status`, `account_id`) VALUES
(7, 59, '2025-08-12', 'Complete', 15),
(8, 60, '2025-08-13', 'Complete', 15),
(9, 58, '2025-08-13', 'Complete', 15),
(10, 61, '2025-08-13', 'Complete', 15),
(11, 64, '2025-08-13', 'Complete', 15),
(12, 65, '2025-08-13', 'Complete', 15),
(13, 66, '2025-08-13', 'Complete', 15),
(14, 67, '2025-08-13', 'Complete', 15),
(15, 68, '2025-08-13', 'Complete', 15),
(16, 69, '2025-08-13', 'Complete', 15),
(17, 70, '2025-08-13', 'Complete', 15),
(18, 71, '2025-08-13', 'Complete', 15),
(19, 72, '2025-08-13', 'Delivered', 15),
(20, 73, '2025-08-13', 'Delivered', 15),
(21, 75, '2025-08-13', 'Complete', 15),
(22, 63, '2025-08-13', 'Delivered', 15),
(23, 62, '2025-08-13', 'Delivered', 15),
(24, 78, '2025-08-14', 'Delivered', 15),
(25, 77, '2025-08-14', 'Complete', 15),
(26, 79, '2025-08-14', 'Complete', 15),
(27, 80, '2025-08-14', 'Complete', 15),
(29, 82, '2025-08-18', 'Complete', 15),
(30, 83, '2025-08-19', 'Complete', 15),
(31, 91, '2025-08-21', 'Complete', 15),
(32, 92, '2025-08-21', 'Complete', 15),
(33, 94, '2025-08-21', 'Complete', 15),
(34, 81, '2025-08-23', 'Complete', 15),
(35, 90, '2025-08-23', 'Delivered', 15),
(36, 96, '2025-08-23', 'Delivered', 15),
(37, 74, '2025-08-27', 'Delivered', 15),
(38, 87, '2025-08-27', 'Delivered', 15),
(39, 97, '2025-08-27', 'Delivered', 15),
(40, 86, '2025-08-27', 'On Delivery', 15),
(41, 84, '2025-09-02', 'On Delivery', 15),
(42, 85, '2025-09-02', 'On Delivery', 15),
(43, 98, '2025-09-02', 'Complete', 15),
(44, 99, '2025-09-02', 'Complete', 15),
(45, 93, '2025-09-02', 'On Delivery', 15),
(46, 102, '2025-09-11', 'Delivered', 15),
(47, 103, '2025-09-14', 'Complete', 15),
(48, 104, '2025-09-14', 'Complete', 15);

-- --------------------------------------------------------

--
-- Table structure for table `request_reports`
--

CREATE TABLE `request_reports` (
  `rr_id` int(11) NOT NULL,
  `request_stock_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time` varchar(10) NOT NULL,
  `status` varchar(100) NOT NULL,
  `account_id` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `request_reports`
--

INSERT INTO `request_reports` (`rr_id`, `request_stock_id`, `date`, `time`, `status`, `account_id`) VALUES
(12, 58, '2025-08-12', '21:33', 'Request Sent', 8),
(13, 59, '2025-08-12', '21:33', 'Request Sent', 8),
(14, 59, '2025-08-12', '21:34', 'On Going', 9),
(15, 59, '2025-08-12', '21:46', 'On Delivery', 9),
(16, 59, '2025-08-12', '23:52', 'Delivered', 8),
(17, 60, '2025-08-13', '00:06', 'Request Sent', 8),
(18, 60, '2025-08-13', '00:08', 'On Going', 9),
(19, 60, '2025-08-13', '00:08', 'On Delivery', 9),
(20, 60, '2025-08-13', '00:08', 'Delivered', 8),
(21, 60, '2025-08-13', '00:08', 'Delivered', 8),
(22, 60, '2025-08-13', '00:09', 'Delivered', 8),
(23, 58, '2025-08-13', '00:19', 'On Going', 9),
(24, 58, '2025-08-13', '00:19', 'On Delivery', 9),
(25, 60, '2025-08-13', '00:45', 'Complete', 9),
(26, 59, '2025-08-13', '00:48', 'Complete', 9),
(27, 61, '2025-08-13', '06:28', 'Request Sent', 8),
(28, 62, '2025-08-13', '06:29', 'Request Sent', 8),
(29, 63, '2025-08-13', '06:35', 'Request Sent', 8),
(30, 61, '2025-08-13', '07:01', 'On Going', 9),
(31, 61, '2025-08-13', '07:06', 'On Delivery', 9),
(32, 61, '2025-08-13', '07:11', 'Delivered', 8),
(33, 61, '2025-08-13', '07:14', 'Complete', 9),
(34, 64, '2025-08-13', '10:17', 'Request Sent', 10),
(35, 64, '2025-08-13', '10:18', 'On Going', 14),
(36, 64, '2025-08-13', '10:18', 'On Delivery', 14),
(37, 64, '2025-08-13', '10:19', 'Delivered', 10),
(38, 64, '2025-08-13', '10:20', 'Complete', 14),
(39, 65, '2025-08-13', '10:25', 'Request Sent', 8),
(40, 65, '2025-08-13', '10:25', 'On Going', 14),
(41, 65, '2025-08-13', '10:25', 'On Delivery', 14),
(42, 65, '2025-08-13', '10:27', 'Delivered', 8),
(43, 66, '2025-08-13', '10:35', 'Request Sent', 10),
(44, 66, '2025-08-13', '10:35', 'On Going', 14),
(45, 66, '2025-08-13', '10:35', 'On Delivery', 14),
(46, 66, '2025-08-13', '10:35', 'Delivered', 10),
(47, 66, '2025-08-13', '10:35', 'Complete', 14),
(48, 67, '2025-08-13', '10:38', 'Request Sent', 10),
(49, 67, '2025-08-13', '10:38', 'On Going', 14),
(50, 67, '2025-08-13', '10:38', 'On Delivery', 14),
(51, 67, '2025-08-13', '10:45', 'Delivered', 10),
(52, 67, '2025-08-13', '10:45', 'Complete', 14),
(53, 68, '2025-08-13', '10:46', 'Request Sent', 10),
(54, 68, '2025-08-13', '10:47', 'On Going', 14),
(55, 68, '2025-08-13', '10:47', 'On Delivery', 14),
(56, 68, '2025-08-13', '10:47', 'Delivered', 10),
(57, 68, '2025-08-13', '10:47', 'Complete', 14),
(58, 69, '2025-08-13', '10:48', 'Request Sent', 10),
(59, 69, '2025-08-13', '10:48', 'On Going', 14),
(60, 69, '2025-08-13', '10:48', 'On Delivery', 14),
(61, 69, '2025-08-13', '10:58', 'Delivered', 10),
(62, 70, '2025-08-13', '11:00', 'Request Sent', 10),
(63, 70, '2025-08-13', '11:00', 'On Going', 14),
(64, 70, '2025-08-13', '11:00', 'On Delivery', 14),
(65, 70, '2025-08-13', '11:00', 'Delivered', 8),
(66, 71, '2025-08-13', '11:10', 'Request Sent', 10),
(67, 71, '2025-08-13', '11:11', 'On Going', 14),
(68, 71, '2025-08-13', '11:11', 'On Delivery', 14),
(69, 72, '2025-08-13', '11:20', 'Request Sent', 10),
(70, 62, '2025-08-13', '11:28', 'On Going', 9),
(71, 72, '2025-08-13', '11:29', 'On Going', 14),
(72, 72, '2025-08-13', '11:40', 'On Delivery', 14),
(73, 63, '2025-08-13', '11:51', 'On Going', 14),
(74, 72, '2025-08-13', '11:52', 'Delivered', 10),
(75, 73, '2025-08-13', '11:59', 'Request Sent', 10),
(76, 73, '2025-08-13', '12:00', 'On Going', 14),
(77, 73, '2025-08-13', '12:00', 'On Delivery', 14),
(78, 71, '2025-08-13', '12:02', 'Delivered', 10),
(79, 73, '2025-08-13', '12:02', 'Delivered', 10),
(80, 74, '2025-08-13', '12:05', 'Request Sent', 10),
(81, 58, '2025-08-13', '23:24', 'Delivered', 8),
(82, 58, '2025-08-13', '23:24', 'Delivered', 8),
(83, 58, '2025-08-13', '23:24', 'Delivered', 8),
(84, 58, '2025-08-13', '23:24', 'Delivered', 8),
(85, 75, '2025-08-13', '23:30', 'Request Sent', 8),
(86, 75, '2025-08-13', '23:31', 'On Going', 9),
(87, 75, '2025-08-13', '23:31', 'On Delivery', 9),
(88, 75, '2025-08-13', '23:31', 'Delivered', 8),
(89, 75, '2025-08-13', '23:31', 'Delivered', 8),
(90, 75, '2025-08-13', '23:31', 'Delivered', 8),
(91, 75, '2025-08-13', '23:31', 'Delivered', 8),
(92, 75, '2025-08-13', '23:31', 'Delivered', 8),
(93, 75, '2025-08-13', '23:31', 'Delivered', 8),
(94, 75, '2025-08-13', '23:33', 'Complete', 9),
(95, 63, '2025-08-13', '23:35', 'On Delivery', 9),
(96, 63, '2025-08-13', '23:35', 'Delivered', 8),
(97, 62, '2025-08-13', '23:50', 'On Delivery', 9),
(98, 62, '2025-08-13', '23:51', 'Delivered', 8),
(99, 77, '2025-08-14', '09:05', 'Request Sent', 8),
(100, 77, '2025-08-14', '09:07', 'On Going', 9),
(101, 78, '2025-08-14', '09:08', 'Request Sent', 8),
(102, 78, '2025-08-14', '09:08', 'On Going', 9),
(103, 78, '2025-08-14', '09:09', 'On Delivery', 9),
(104, 77, '2025-08-14', '09:11', 'On Delivery', 9),
(105, 79, '2025-08-14', '09:26', 'Request Sent', 8),
(106, 80, '2025-08-14', '10:03', 'Request Sent', 8),
(107, 80, '2025-08-14', '10:13', 'On Going', 9),
(108, 79, '2025-08-14', '10:14', 'On Going', 9),
(109, 79, '2025-08-14', '10:19', 'On Delivery', 9),
(110, 80, '2025-08-14', '10:19', 'On Delivery', 9),
(111, 80, '2025-08-14', '10:26', 'Delivered', 8),
(112, 80, '2025-08-14', '10:27', 'Complete', 9),
(113, 81, '2025-08-14', '22:14', 'Request Sent', 8),
(114, 82, '2025-08-15', '15:16', 'Request Sent', 8),
(115, 79, '2025-08-15', '15:21', 'Delivered', 8),
(116, 82, '2025-08-18', '21:22', 'On Going', 9),
(117, 82, '2025-08-18', '22:04', 'On Delivery', 9),
(118, 82, '2025-08-18', '22:34', 'On Delivery', 9),
(119, 83, '2025-08-18', '22:35', 'Request Sent', 8),
(120, 83, '2025-08-18', '22:35', 'On Going', 9),
(121, 81, '2025-08-18', '22:49', 'On Going', 9),
(122, 74, '2025-08-18', '22:49', 'On Going', 9),
(123, 84, '2025-08-18', '23:28', 'Request Sent', 8),
(124, 85, '2025-08-18', '23:28', 'Request Sent', 8),
(125, 86, '2025-08-18', '23:29', 'Request Sent', 8),
(126, 87, '2025-08-18', '23:50', 'Request Sent', 8),
(127, 87, '2025-08-19', '00:02', 'On Going', 9),
(128, 86, '2025-08-19', '00:15', 'On Going', 9),
(129, 85, '2025-08-19', '00:18', 'On Going', 9),
(130, 84, '2025-08-19', '00:29', 'On Going', 9),
(131, 83, '2025-08-19', '01:24', 'On Delivery', 9),
(132, 88, '2025-08-19', '01:27', 'Request Sent', 8),
(133, 58, '2025-08-19', '03:55', 'Complete', 9),
(134, 65, '2025-08-19', '03:56', 'Complete', 9),
(136, 69, '2025-08-19', '14:33', 'Complete', 9),
(137, 70, '2025-08-19', '14:33', 'Complete', 9),
(138, 89, '2025-08-21', '11:13', 'Request Sent', 8),
(139, 90, '2025-08-21', '11:14', 'Request Sent', 8),
(140, 90, '2025-08-21', '13:05', 'On Going', 9),
(141, 91, '2025-08-21', '13:25', 'Request Sent', 8),
(142, 91, '2025-08-21', '13:27', 'On Going', 9),
(143, 91, '2025-08-21', '13:27', 'On Delivery', 9),
(144, 83, '2025-08-21', '13:27', 'Delivered', 8),
(145, 91, '2025-08-21', '13:28', 'Delivered', 8),
(146, 91, '2025-08-21', '13:28', 'Complete', 9),
(147, 83, '2025-08-21', '13:41', 'Complete', 9),
(148, 92, '2025-08-21', '13:42', 'Request Sent', 8),
(149, 92, '2025-08-21', '13:43', 'On Going', 9),
(150, 92, '2025-08-21', '13:43', 'On Delivery', 9),
(151, 92, '2025-08-21', '13:43', 'Delivered', 8),
(152, 92, '2025-08-21', '13:44', 'Complete', 9),
(153, 93, '2025-08-21', '13:54', 'Request Sent', 8),
(154, 94, '2025-08-21', '14:11', 'Request Sent', 8),
(155, 93, '2025-08-21', '14:11', 'On Going', 9),
(156, 88, '2025-08-21', '14:11', 'On Going', 9),
(157, 94, '2025-08-21', '14:15', 'On Going', 9),
(158, 94, '2025-08-21', '14:15', 'On Delivery', 9),
(159, 94, '2025-08-21', '14:16', 'Delivered', 8),
(160, 94, '2025-08-21', '14:19', 'Complete', 9),
(161, 79, '2025-08-21', '14:19', 'Complete', 9),
(162, 95, '2025-08-21', '14:42', 'Request Sent', 8),
(163, 81, '2025-08-23', '17:06', 'On Delivery', 9),
(164, 81, '2025-08-23', '17:07', 'Delivered', 8),
(165, 81, '2025-08-23', '17:08', 'Complete', 9),
(166, 77, '2025-08-23', '17:12', 'Delivered', 8),
(167, 78, '2025-08-23', '17:12', 'Delivered', 8),
(172, 90, '2025-08-23', '17:43', 'On Delivery', 9),
(173, 77, '2025-08-23', '17:43', 'Complete', 9),
(174, 96, '2025-08-23', '17:46', 'Request Sent', 8),
(175, 96, '2025-08-23', '17:47', 'On Going', 9),
(176, 96, '2025-08-23', '17:47', 'On Going', 9),
(177, 96, '2025-08-23', '17:47', 'On Going', 9),
(178, 96, '2025-08-23', '17:47', 'On Going', 9),
(179, 96, '2025-08-23', '17:47', 'On Going', 9),
(180, 96, '2025-08-23', '17:47', 'On Going', 9),
(181, 96, '2025-08-23', '17:47', 'On Going', 9),
(182, 96, '2025-08-23', '17:47', 'On Going', 9),
(183, 96, '2025-08-23', '17:47', 'On Delivery', 9),
(184, 96, '2025-08-23', '17:48', 'Delivered', 8),
(185, 82, '2025-08-27', '01:06', 'Delivered', 8),
(186, 90, '2025-08-27', '01:08', 'Delivered', 8),
(187, 74, '2025-08-27', '01:10', 'On Delivery', 9),
(188, 74, '2025-08-27', '01:10', 'Delivered', 8),
(189, 87, '2025-08-27', '01:12', 'On Delivery', 9),
(190, 87, '2025-08-27', '01:13:45', 'Delivered', 8),
(191, 97, '2025-08-27', '14:46', 'Request Sent', 8),
(192, 97, '2025-08-27', '14:49', 'On Going', 9),
(193, 97, '2025-08-27', '15:05', 'On Delivery', 9),
(197, 97, '2025-08-27', '15:10', 'Delivered', 8),
(198, 86, '2025-08-27', '20:00', 'On Delivery', 9),
(199, 71, '2025-09-01', '00:31', 'Complete', 9),
(200, 89, '2025-09-02', '12:15', 'On Going', 9),
(201, 95, '2025-09-02', '12:15', 'On Going', 9),
(202, 84, '2025-09-02', '12:26', 'On Delivery', 9),
(203, 85, '2025-09-02', '12:27', 'On Delivery', 9),
(204, 98, '2025-09-02', '12:27', 'Request Sent', 8),
(205, 98, '2025-09-02', '12:28', 'On Going', 9),
(206, 98, '2025-09-02', '12:30', 'On Delivery', 9),
(207, 99, '2025-09-02', '12:31', 'Request Sent', 17),
(208, 99, '2025-09-02', '12:32', 'On Going', 9),
(209, 99, '2025-09-02', '12:33', 'On Delivery', 9),
(210, 99, '2025-09-02', '12:36', 'Delivered', 17),
(211, 99, '2025-09-02', '12:38', 'Complete', 9),
(212, 93, '2025-09-02', '13:14', 'On Delivery', 9),
(213, 100, '2025-09-02', '13:22', 'Request Sent', 17),
(214, 100, '2025-09-03', '14:10', 'On Going', 9),
(215, 101, '2025-09-09', '20:46', 'Request Sent', 8),
(216, 102, '2025-09-11', '13:59', 'Request Sent', 8),
(217, 102, '2025-09-11', '13:59', 'On Going', 9),
(218, 102, '2025-09-11', '14:00', 'On Delivery', 9),
(219, 102, '2025-09-11', '14:02', 'Delivered', 8),
(220, 103, '2025-09-14', '00:41', 'Request Sent', 8),
(221, 103, '2025-09-14', '00:44', 'On Going', 9),
(222, 103, '2025-09-14', '00:53', 'On Delivery', 9),
(223, 103, '2025-09-14', '00:53', 'Delivered', 8),
(224, 103, '2025-09-14', '00:53', 'Complete', 9),
(225, 98, '2025-09-14', '01:02', 'Delivered', 8),
(226, 98, '2025-09-14', '01:02', 'Complete', 9),
(227, 104, '2025-09-14', '01:10', 'Request Sent', 8),
(228, 105, '2025-09-14', '01:14', 'Request Sent', 8),
(229, 104, '2025-09-14', '01:16', 'On Going', 9),
(230, 104, '2025-09-14', '01:16', 'On Delivery', 9),
(231, 104, '2025-09-14', '01:17', 'Delivered', 8),
(232, 104, '2025-09-14', '01:17', 'Complete', 9),
(233, 82, '2025-09-22', '17:51', 'Complete', 9);

-- --------------------------------------------------------

--
-- Table structure for table `request_stock`
--

CREATE TABLE `request_stock` (
  `request_stock_id` int(20) NOT NULL,
  `request_from` int(20) NOT NULL,
  `request_to` int(20) NOT NULL,
  `date` varchar(10) NOT NULL,
  `request_status` varchar(50) NOT NULL,
  `request_by` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `request_stock`
--

INSERT INTO `request_stock` (`request_stock_id`, `request_from`, `request_to`, `date`, `request_status`, `request_by`) VALUES
(58, 12, 13, '2025-08-12', 'Complete', 8),
(59, 12, 13, '2025-08-12', 'Complete', 8),
(60, 12, 13, '2025-08-13', 'Complete', 8),
(61, 12, 13, '2025-08-13', 'Complete', 8),
(62, 12, 13, '2025-08-13', 'Delivered', 8),
(63, 12, 13, '2025-08-13', 'Delivered', 8),
(64, 12, 13, '2025-08-13', 'Complete', 10),
(65, 12, 13, '2025-08-13', 'Complete', 8),
(66, 12, 13, '2025-08-13', 'Complete', 10),
(67, 12, 13, '2025-08-13', 'Complete', 10),
(68, 12, 13, '2025-08-13', 'Complete', 10),
(69, 12, 13, '2025-08-13', 'Complete', 10),
(70, 12, 13, '2025-08-13', 'Complete', 10),
(71, 12, 13, '2025-08-13', 'Complete', 10),
(72, 12, 13, '2025-08-13', 'Delivered', 10),
(73, 12, 13, '2025-08-13', 'Delivered', 10),
(74, 12, 13, '2025-08-13', 'Delivered', 10),
(75, 12, 13, '2025-08-13', 'Complete', 8),
(77, 12, 13, '2025-08-14', 'Complete', 8),
(78, 12, 13, '2025-08-14', 'Delivered', 8),
(79, 12, 13, '2025-08-14', 'Complete', 8),
(80, 12, 13, '2025-08-14', 'Complete', 8),
(81, 12, 13, '2025-08-14', 'Complete', 8),
(82, 12, 13, '2025-08-15', 'Complete', 8),
(83, 12, 13, '2025-08-18', 'Complete', 8),
(84, 12, 13, '2025-08-18', 'On Delivery', 8),
(85, 12, 13, '2025-08-18', 'On Delivery', 8),
(86, 12, 13, '2025-08-18', 'On Delivery', 8),
(87, 12, 13, '2025-08-18', 'Delivered', 8),
(88, 12, 13, '2025-08-19', 'On Going', 8),
(89, 12, 13, '2025-08-21', 'On Going', 8),
(90, 12, 13, '2025-08-21', 'Delivered', 8),
(91, 12, 13, '2025-08-21', 'Complete', 8),
(92, 12, 13, '2025-08-21', 'Complete', 8),
(93, 12, 13, '2025-08-21', 'On Delivery', 8),
(94, 12, 13, '2025-08-21', 'Complete', 8),
(95, 12, 13, '2025-08-21', 'On Going', 8),
(96, 12, 13, '2025-08-23', 'Delivered', 8),
(97, 12, 13, '2025-08-27', 'Delivered', 8),
(98, 14, 13, '2025-09-02', 'Complete', 8),
(99, 14, 13, '2025-09-02', 'Complete', 17),
(100, 12, 13, '2025-09-02', 'On Going', 17),
(101, 12, 13, '2025-09-09', 'Pending', 8),
(102, 12, 13, '2025-09-11', 'Delivered', 8),
(103, 14, 13, '2025-09-14', 'Complete', 8),
(104, 12, 13, '2025-09-14', 'Complete', 8),
(105, 12, 13, '2025-09-14', 'Pending', 8);

-- --------------------------------------------------------

--
-- Table structure for table `request_stock_details`
--

CREATE TABLE `request_stock_details` (
  `request_stock__details_id` int(20) NOT NULL,
  `request__stock_id` int(20) NOT NULL,
  `product_id` int(20) NOT NULL,
  `qty` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `request_stock_details`
--

INSERT INTO `request_stock_details` (`request_stock__details_id`, `request__stock_id`, `product_id`, `qty`) VALUES
(104, 58, 65, 1),
(105, 58, 48, 1),
(106, 58, 69, 1),
(107, 58, 66, 1),
(108, 59, 65, 6),
(109, 59, 44, 2),
(110, 60, 65, 4),
(111, 61, 63, 2),
(112, 61, 20, 2),
(113, 62, 67, 3),
(114, 62, 45, 2),
(115, 63, 48, 4),
(116, 63, 50, 2),
(117, 64, 44, 2),
(118, 65, 44, 5),
(119, 66, 65, 5),
(120, 67, 65, 3),
(121, 68, 65, 10),
(122, 69, 65, 20),
(123, 70, 65, 5),
(124, 71, 49, 5),
(125, 71, 45, 5),
(126, 71, 64, 5),
(127, 71, 66, 5),
(128, 71, 72, 5),
(129, 71, 46, 5),
(130, 71, 67, 5),
(131, 72, 65, 5),
(132, 72, 44, 5),
(133, 72, 69, 5),
(134, 72, 70, 5),
(135, 72, 47, 5),
(136, 72, 51, 5),
(137, 72, 63, 5),
(138, 72, 52, 5),
(139, 72, 68, 5),
(140, 72, 21, 5),
(141, 73, 20, 5),
(142, 73, 50, 5),
(143, 73, 48, 5),
(144, 73, 71, 5),
(145, 73, 43, 5),
(146, 73, 49, 5),
(147, 73, 45, 5),
(148, 73, 64, 5),
(149, 73, 66, 5),
(150, 73, 72, 5),
(151, 74, 46, 1),
(152, 74, 67, 1),
(153, 74, 19, 1),
(154, 75, 44, 2),
(155, 77, 70, 2),
(156, 77, 68, 1),
(157, 78, 44, 1),
(158, 79, 44, 1),
(159, 80, 67, 3),
(160, 81, 70, 2),
(161, 82, 70, 1),
(162, 82, 66, 1),
(163, 82, 68, 1),
(164, 82, 44, 1),
(165, 82, 65, 1),
(166, 82, 45, 1),
(167, 83, 65, 1),
(168, 84, 44, 1),
(169, 84, 70, 2),
(170, 85, 52, 6),
(171, 86, 69, 2),
(172, 86, 68, 2),
(173, 87, 65, 1),
(174, 87, 70, 1),
(175, 87, 66, 1),
(176, 87, 68, 1),
(177, 87, 45, 1),
(178, 87, 69, 2),
(179, 87, 48, 2),
(180, 87, 46, 3),
(181, 87, 43, 3),
(182, 87, 67, 2),
(183, 87, 50, 2),
(184, 88, 20, 2),
(185, 89, 68, 1),
(186, 89, 45, 1),
(187, 89, 70, 1),
(188, 89, 66, 1),
(189, 89, 65, 1),
(190, 90, 65, 1),
(191, 91, 65, 1),
(192, 92, 70, 2),
(193, 93, 52, 1),
(194, 93, 21, 1),
(195, 93, 63, 1),
(196, 93, 43, 1),
(197, 93, 47, 1),
(198, 94, 69, 3),
(199, 95, 47, 1),
(200, 95, 21, 1),
(201, 95, 63, 1),
(202, 96, 47, 1),
(203, 97, 47, 1),
(204, 97, 21, 1),
(205, 97, 63, 1),
(206, 97, 43, 1),
(207, 97, 20, 1),
(208, 97, 19, 1),
(209, 97, 68, 1),
(210, 97, 52, 1),
(211, 97, 44, 5),
(212, 97, 69, 1),
(213, 97, 67, 1),
(214, 97, 45, 1),
(215, 97, 48, 1),
(216, 97, 50, 1),
(217, 97, 71, 1),
(218, 97, 49, 1),
(219, 97, 70, 1),
(220, 97, 66, 1),
(221, 97, 72, 1),
(222, 97, 64, 1),
(223, 97, 65, 1),
(224, 97, 51, 1),
(225, 97, 46, 1),
(226, 98, 47, 1),
(227, 98, 21, 1),
(228, 98, 43, 1),
(229, 98, 63, 1),
(230, 98, 20, 2),
(231, 99, 46, 1),
(232, 99, 51, 1),
(233, 99, 65, 1),
(234, 100, 47, 1),
(235, 101, 47, 1),
(236, 101, 21, 1),
(237, 102, 47, 1),
(238, 102, 21, 1),
(239, 102, 43, 1),
(240, 102, 63, 1),
(241, 102, 20, 1),
(242, 102, 19, 1),
(243, 102, 70, 1),
(244, 103, 48, 5),
(245, 103, 44, 1),
(246, 104, 68, 2),
(247, 104, 50, 2),
(248, 104, 72, 2),
(249, 105, 47, 1);

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `role_id` int(50) NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`role_id`, `role_name`) VALUES
(1, 'Admin'),
(2, 'Sales Clerk'),
(3, 'Inventory Manager'),
(4, 'Driver'),
(5, 'Warehouse Representative');

-- --------------------------------------------------------

--
-- Table structure for table `stock_adjustment`
--

CREATE TABLE `stock_adjustment` (
  `sa_id` int(50) NOT NULL,
  `account_id` int(50) NOT NULL,
  `location_id` int(50) NOT NULL,
  `date` date NOT NULL,
  `time` time(6) NOT NULL,
  `type` varchar(1000) NOT NULL,
  `statement` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_adjustment_details`
--

CREATE TABLE `stock_adjustment_details` (
  `sad_id` int(50) NOT NULL,
  `sa_id` int(50) NOT NULL,
  `product_id` int(50) NOT NULL,
  `qty` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_receiving`
--

CREATE TABLE `stock_receiving` (
  `stock_receiving_id` int(50) NOT NULL,
  `transaction_date` date NOT NULL,
  `total_item` int(50) NOT NULL,
  `report` varchar(1000) NOT NULL,
  `account_id` int(50) NOT NULL,
  `location_id` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_receiving`
--

INSERT INTO `stock_receiving` (`stock_receiving_id`, `transaction_date`, `total_item`, `report`, `account_id`, `location_id`) VALUES
(4, '2025-08-27', 19, 'Stock In From Delivery', 8, 12),
(5, '2025-08-27', 2, 'Stock In From Delivery', 9, 13),
(9, '2025-08-27', 27, 'Stock In From Delivery', 8, 12),
(10, '2025-09-02', 3, 'Stock In From Delivery', 17, 14),
(11, '2025-09-02', 3, 'Stock In From Delivery', 9, 13),
(12, '2025-09-02', 1, 'Stock In From Delivery', 9, 13),
(13, '2025-09-02', 1, 'Stock In From Delivery', 9, 13),
(14, '2025-09-11', 7, 'Stock In From Delivery', 8, 12),
(15, '2025-09-14', 6, 'Stock In From Delivery', 8, 14),
(16, '2025-09-14', 6, 'Stock In From Delivery', 8, 14),
(17, '2025-09-14', 6, 'Stock In From Delivery', 8, 12);

-- --------------------------------------------------------

--
-- Table structure for table `stock_receiving_details`
--

CREATE TABLE `stock_receiving_details` (
  `srd_id` int(11) NOT NULL,
  `product_id` int(50) NOT NULL,
  `stock_receiving_id` int(50) NOT NULL,
  `qty` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_receiving_details`
--

INSERT INTO `stock_receiving_details` (`srd_id`, `product_id`, `stock_receiving_id`, `qty`) VALUES
(1, 43, 4, 3),
(2, 45, 4, 1),
(3, 46, 4, 3),
(4, 48, 4, 2),
(5, 50, 4, 2),
(6, 65, 4, 1),
(7, 66, 4, 1),
(8, 67, 4, 2),
(9, 68, 4, 1),
(10, 69, 4, 2),
(11, 70, 4, 1),
(12, 44, 5, 2),
(13, 19, 9, 1),
(14, 20, 9, 1),
(15, 21, 9, 1),
(16, 43, 9, 1),
(17, 44, 9, 5),
(18, 45, 9, 1),
(19, 46, 9, 1),
(20, 47, 9, 1),
(21, 48, 9, 1),
(22, 49, 9, 1),
(23, 50, 9, 1),
(24, 51, 9, 1),
(25, 52, 9, 1),
(26, 63, 9, 1),
(27, 64, 9, 1),
(28, 65, 9, 1),
(29, 66, 9, 1),
(30, 67, 9, 1),
(31, 68, 9, 1),
(32, 69, 9, 1),
(33, 70, 9, 1),
(34, 71, 9, 1),
(35, 72, 9, 1),
(36, 46, 10, 1),
(37, 51, 10, 1),
(38, 65, 10, 1),
(39, 44, 11, 3),
(40, 44, 12, 1),
(41, 65, 13, 1),
(42, 19, 14, 1),
(43, 20, 14, 1),
(44, 21, 14, 1),
(45, 43, 14, 1),
(46, 47, 14, 1),
(47, 63, 14, 1),
(48, 70, 14, 1),
(49, 44, 15, 1),
(50, 48, 15, 5),
(51, 20, 16, 2),
(52, 21, 16, 1),
(53, 43, 16, 1),
(54, 47, 16, 1),
(55, 63, 16, 1),
(56, 50, 17, 2),
(57, 68, 17, 2),
(58, 72, 17, 2);

-- --------------------------------------------------------

--
-- Table structure for table `store_inventory`
--

CREATE TABLE `store_inventory` (
  `store_inventory_id` int(50) NOT NULL,
  `location_id` int(50) NOT NULL,
  `product_id` int(50) NOT NULL,
  `qty` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `store_inventory`
--

INSERT INTO `store_inventory` (`store_inventory_id`, `location_id`, `product_id`, `qty`) VALUES
(7, 12, 48, 13),
(8, 12, 20, 1),
(9, 12, 70, 1),
(10, 12, 69, 8),
(13, 12, 50, 12),
(14, 12, 51, 7),
(15, 12, 52, 5),
(16, 12, 43, 1),
(17, 12, 66, 2),
(19, 13, 19, 1),
(20, 13, 20, 1),
(21, 13, 21, 1),
(22, 13, 43, 1),
(23, 13, 44, 11),
(24, 13, 45, 2),
(25, 13, 46, 2),
(26, 13, 47, 5),
(27, 13, 48, 0),
(28, 13, 49, 0),
(29, 13, 50, 1),
(30, 13, 51, 3),
(31, 13, 52, 1),
(32, 13, 63, 1),
(33, 13, 64, 2),
(34, 13, 65, 7),
(35, 13, 66, 0),
(36, 13, 67, 3),
(37, 13, 68, 1),
(38, 13, 69, 1),
(39, 13, 70, 0),
(40, 13, 71, 0),
(41, 13, 72, 0),
(42, 12, 21, 0),
(47, 12, 19, 1),
(48, 12, 47, 0),
(49, 12, 68, 3),
(53, 12, 63, 1),
(54, 12, 44, 5),
(58, 12, 65, 2),
(59, 12, 45, 2),
(60, 12, 46, 9),
(61, 12, 49, 11),
(62, 12, 64, 10),
(63, 12, 67, 6),
(64, 12, 72, 13),
(65, 12, 71, 6),
(66, 14, 46, 1),
(67, 14, 51, 1),
(68, 14, 65, 1),
(69, 14, 44, 1),
(70, 14, 48, 5),
(71, 14, 20, 2),
(72, 14, 21, 1),
(73, 14, 43, 0),
(74, 14, 47, 0),
(75, 14, 63, 1);

-- --------------------------------------------------------

--
-- Table structure for table `store_inventory_transaction_ledger`
--

CREATE TABLE `store_inventory_transaction_ledger` (
  `sir_id` int(50) NOT NULL,
  `location_id` int(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `product_id` int(11) NOT NULL,
  `past_balance` int(50) NOT NULL,
  `qty` int(50) NOT NULL,
  `current_balance` int(50) NOT NULL,
  `date` date NOT NULL,
  `time` varchar(6) NOT NULL,
  `account_id` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `store_inventory_transaction_ledger`
--

INSERT INTO `store_inventory_transaction_ledger` (`sir_id`, `location_id`, `type`, `product_id`, `past_balance`, `qty`, `current_balance`, `date`, `time`, `account_id`) VALUES
(1, 13, 'Transfer', 20, 1, 1, 0, '2025-08-02', '00:39:', 9),
(2, 13, 'Transfer', 51, 2, 1, 1, '2025-08-02', '00:39:', 9),
(3, 13, 'Transfer', 69, 1, 1, 0, '2025-08-02', '00:39:', 9),
(4, 13, 'Transfer', 65, 1, 1, 0, '2025-08-02', '00:48:', 9),
(5, 13, 'Transfer', 65, 1, 1, 0, '2025-08-02', '00:48:', 9),
(6, 13, 'Transfer', 49, 3, 1, 2, '2025-08-03', '21:35:', 9),
(14, 13, 'Transfer', 49, 2, 1, 1, '2025-08-03', '22:20:', 9),
(15, 13, 'Transfer', 49, 2, 1, 1, '2025-08-03', '22:20:', 9),
(16, 13, 'Transfer', 49, 1, 1, 0, '2025-08-03', '22:22:', 9),
(17, 13, 'Transfer', 19, 3, 1, 2, '2025-08-03', '22:30:', 9),
(18, 13, 'Transfer', 46, 1, 1, 0, '2025-08-03', '22:53:', 9),
(19, 13, 'Transfer', 19, 2, 1, 1, '2025-08-03', '23:05:', 9),
(21, 13, 'Transfer', 21, 1, 1, 0, '2025-08-03', '23:08:', 9),
(22, 13, 'Transfer', 47, 3, 1, 2, '2025-08-05', '07:30:', 9),
(23, 13, 'Transfer', 70, 1, 1, 0, '2025-08-05', '07:33:', 9),
(25, 13, 'Transfer Out', 51, 1, 1, 0, '2025-08-05', '09:50:', 9),
(35, 13, 'Transfer Out', 20, 3, 1, 2, '2025-08-05', '11:17:', 9),
(36, 13, 'Transfer Out', 43, 2, 1, 1, '2025-08-05', '11:17:', 9),
(37, 13, 'Transfer Out', 52, 2, 1, 1, '2025-08-05', '11:17:', 9),
(42, 13, 'Transfer Out', 47, 2, 1, 1, '2025-08-05', '21:48:', 9),
(45, 13, 'Transfer Out', 68, 2, 1, 1, '2025-08-05', '23:28', 9),
(47, 13, 'Transfer Out', 20, 2, 1, 1, '2025-08-05', '23:30', 9),
(48, 13, 'Transfer Out', 21, 2, 1, 1, '2025-08-05', '23:32', 9),
(51, 13, 'Transfer Out', 44, 2, 1, 1, '2025-08-11', '13:05', 9),
(102, 12, 'Stock In', 48, 8, 4, 12, '2025-08-13', '23:42', 8),
(103, 12, 'Stock In', 45, 10, 2, 12, '2025-08-13', '23:51', 8),
(104, 12, 'Stock In', 67, 5, 3, 8, '2025-08-13', '23:51', 8),
(105, 13, 'Stock In', 65, 0, 2, 2, '2025-08-14', '06:27', 9),
(106, 13, 'Stock In', 44, 1, 1, 2, '2025-08-14', '06:29', 9),
(107, 12, 'Stock In', 67, 0, 3, 3, '2025-08-14', '10:26', 8),
(108, 12, 'Stock In', 44, 0, 1, 1, '2025-08-15', '15:21', 8),
(110, 13, 'Stock In', 65, 2, 1, 3, '2025-08-19', '12:29', 9),
(111, 13, 'Stock In', 65, 3, 1, 4, '2025-08-19', '12:30', 9),
(112, 13, 'Stock In', 44, 2, 1, 3, '2025-08-19', '12:30', 9),
(113, 13, 'Stock In', 47, 1, 2, 3, '2025-08-19', '12:31', 9),
(114, 13, 'Stock In', 47, 3, 2, 5, '2025-08-19', '12:31', 9),
(115, 13, 'Stock In', 63, 0, 1, 1, '2025-08-19', '12:31', 9),
(116, 0, 'Stock In', 65, 0, 1, 1, '2025-08-21', '13:27', 8),
(117, 0, 'Stock In', 65, 0, 1, 1, '2025-08-21', '13:28', 8),
(118, 0, 'Stock In', 70, 0, 2, 2, '2025-08-21', '13:43', 8),
(119, 13, 'Stock In', 44, 3, 2, 5, '2025-08-21', '14:14', 9),
(120, 13, 'Stock In', 69, 0, 1, 1, '2025-08-21', '14:14', 9),
(121, 0, 'Stock In', 69, 8, 3, 11, '2025-08-21', '14:16', 8),
(122, 0, 'Stock In', 70, 0, 2, 2, '2025-08-23', '17:07', 8),
(123, 0, 'Stock In', 68, 0, 1, 1, '2025-08-23', '17:12', 8),
(124, 0, 'Stock In', 70, 0, 2, 2, '2025-08-23', '17:12', 8),
(125, 0, 'Stock In', 44, 1, 1, 2, '2025-08-23', '17:12', 8),
(126, 13, 'Stock In', 65, 4, 2, 6, '2025-08-23', '17:42', 9),
(127, 0, 'Stock In', 47, 7, 1, 8, '2025-08-23', '17:48', 8),
(128, 0, 'Stock In', 44, 1, 1, 2, '2025-08-27', '01:06', 8),
(129, 0, 'Stock In', 45, 0, 1, 1, '2025-08-27', '01:06', 8),
(130, 0, 'Stock In', 65, 0, 1, 1, '2025-08-27', '01:06', 8),
(131, 0, 'Stock In', 66, 0, 1, 1, '2025-08-27', '01:06', 8),
(132, 0, 'Stock In', 68, 0, 1, 1, '2025-08-27', '01:06', 8),
(133, 0, 'Stock In', 70, 0, 1, 1, '2025-08-27', '01:06', 8),
(134, 0, 'Stock In', 65, 0, 1, 1, '2025-08-27', '01:08', 8),
(135, 0, 'Stock In', 19, 2, 1, 3, '2025-08-27', '01:10', 8),
(136, 0, 'Stock In', 46, 5, 1, 6, '2025-08-27', '01:10', 8),
(137, 0, 'Stock In', 67, 3, 1, 4, '2025-08-27', '01:10', 8),
(138, 12, 'Stock In', 43, 6, 3, 9, '2025-08-27', '01:13:', 8),
(139, 12, 'Stock In', 45, 0, 1, 1, '2025-08-27', '01:13:', 8),
(140, 12, 'Stock In', 46, 5, 3, 8, '2025-08-27', '01:13:', 8),
(141, 12, 'Stock In', 48, 12, 2, 14, '2025-08-27', '01:13:', 8),
(142, 12, 'Stock In', 50, 8, 2, 10, '2025-08-27', '01:13:', 8),
(143, 12, 'Stock In', 65, 0, 1, 1, '2025-08-27', '01:13:', 8),
(144, 12, 'Stock In', 66, 0, 1, 1, '2025-08-27', '01:13:', 8),
(145, 12, 'Stock In', 67, 3, 2, 5, '2025-08-27', '01:13:', 8),
(146, 12, 'Stock In', 68, 0, 1, 1, '2025-08-27', '01:13:', 8),
(147, 12, 'Stock In', 69, 8, 2, 10, '2025-08-27', '01:13:', 8),
(148, 12, 'Stock In', 70, 0, 1, 1, '2025-08-27', '01:13:', 8),
(149, 13, 'Stock In', 44, 5, 2, 7, '2025-08-27', '01:17', 9),
(219, 12, 'Stock In', 19, 0, 1, 1, '2025-08-27', '15:10', 8),
(220, 12, 'Stock In', 20, 0, 1, 1, '2025-08-27', '15:10', 8),
(221, 12, 'Stock In', 21, 6, 1, 7, '2025-08-27', '15:10', 8),
(222, 12, 'Stock In', 43, 9, 1, 10, '2025-08-27', '15:10', 8),
(223, 12, 'Stock In', 44, 1, 5, 6, '2025-08-27', '15:10', 8),
(224, 12, 'Stock In', 45, 1, 1, 2, '2025-08-27', '15:10', 8),
(225, 12, 'Stock In', 46, 8, 1, 9, '2025-08-27', '15:10', 8),
(226, 12, 'Stock In', 47, 7, 1, 8, '2025-08-27', '15:10', 8),
(227, 12, 'Stock In', 48, 14, 1, 15, '2025-08-27', '15:10', 8),
(228, 12, 'Stock In', 49, 10, 1, 11, '2025-08-27', '15:10', 8),
(229, 12, 'Stock In', 50, 10, 1, 11, '2025-08-27', '15:10', 8),
(230, 12, 'Stock In', 51, 6, 1, 7, '2025-08-27', '15:10', 8),
(231, 12, 'Stock In', 52, 6, 1, 7, '2025-08-27', '15:10', 8),
(232, 12, 'Stock In', 63, 7, 1, 8, '2025-08-27', '15:10', 8),
(233, 12, 'Stock In', 64, 10, 1, 11, '2025-08-27', '15:10', 8),
(234, 12, 'Stock In', 65, 1, 1, 2, '2025-08-27', '15:10', 8),
(235, 12, 'Stock In', 66, 1, 1, 2, '2025-08-27', '15:10', 8),
(236, 12, 'Stock In', 67, 5, 1, 6, '2025-08-27', '15:10', 8),
(237, 12, 'Stock In', 68, 1, 1, 2, '2025-08-27', '15:10', 8),
(238, 12, 'Stock In', 69, 10, 1, 11, '2025-08-27', '15:10', 8),
(239, 12, 'Stock In', 70, 0, 1, 1, '2025-08-27', '15:10', 8),
(240, 12, 'Stock In', 71, 5, 1, 6, '2025-08-27', '15:10', 8),
(241, 12, 'Stock In', 72, 10, 1, 11, '2025-08-27', '15:10', 8),
(242, 12, 'Sales', 44, 6, 1, 5, '2025-08-27', '20:24', 12),
(247, 12, 'Sales', 47, 8, 1, 7, '2025-08-27', '21:14:', 12),
(248, 12, 'Sales', 43, 10, 1, 9, '2025-08-27', '21:32', 12),
(252, 12, 'Sales', 47, 7, 1, 6, '2025-08-30', '21:51', 12),
(253, 12, 'Sales', 47, 6, 1, 5, '2025-08-31', '00:33', 12),
(254, 12, 'Sales', 21, 7, 2, 5, '2025-08-31', '20:04', 12),
(255, 12, 'Sales', 63, 8, 1, 7, '2025-08-31', '20:18', 12),
(259, 12, 'Sales', 43, 9, 1, 8, '2025-08-31', '20:26', 12),
(260, 12, 'Sales', 43, 8, 1, 7, '2025-09-02', '08:06', 12),
(261, 12, 'Sales', 47, 5, 1, 4, '2025-09-02', '08:15', 12),
(262, 12, 'Sales', 20, 1, 1, 0, '2025-09-02', '08:24', 12),
(263, 14, 'Stock In', 46, 0, 1, 1, '2025-09-02', '12:36', 17),
(264, 14, 'Stock In', 51, 0, 1, 1, '2025-09-02', '12:36', 17),
(265, 14, 'Stock In', 65, 0, 1, 1, '2025-09-02', '12:36', 17),
(266, 13, 'Stock In', 44, 7, 3, 10, '2025-09-02', '12:44', 9),
(267, 12, 'Sales', 47, 4, 1, 3, '2025-09-02', '12:49', 12),
(268, 12, 'Sales', 21, 5, 1, 4, '2025-09-02', '12:49', 12),
(269, 13, 'Stock In', 44, 10, 1, 11, '2025-09-02', '13:12', 9),
(270, 13, 'Stock In', 65, 6, 1, 7, '2025-09-02', '13:15', 9),
(271, 12, 'Sales', 63, 7, 2, 5, '2025-09-02', '14:32', 12),
(272, 12, 'Sales', 21, 4, 1, 3, '2025-09-02', '14:34', 12),
(273, 12, 'Sales', 19, 1, 1, 0, '2025-09-02', '17:58', 12),
(274, 12, 'Sales', 47, 3, 1, 2, '2025-09-03', '10:16', 12),
(275, 12, 'Sales', 43, 7, 1, 6, '2025-09-03', '10:20', 12),
(276, 12, 'Sales', 21, 3, 1, 2, '2025-09-03', '10:42', 12),
(277, 12, 'Sales', 21, 2, 1, 1, '2025-09-03', '10:45', 12),
(279, 12, 'Sales', 47, 2, 2, 0, '2025-09-03', '11:35', 12),
(280, 12, 'Sales', 21, 1, 1, 0, '2025-09-03', '14:41', 12),
(281, 12, 'Sales', 43, 6, 1, 5, '2025-09-03', '21:43', 12),
(282, 12, 'Sales', 63, 5, 1, 4, '2025-09-03', '22:02', 12),
(283, 12, 'Sales', 43, 5, 1, 4, '2025-09-03', '22:04', 12),
(284, 12, 'Sales', 63, 4, 1, 3, '2025-09-03', '22:04', 12),
(285, 12, 'Sales', 63, 3, 1, 2, '2025-09-03', '22:14', 12),
(286, 12, 'Sales', 63, 2, 1, 1, '2025-09-04', '02:51', 12),
(287, 12, 'Sales', 43, 4, 1, 3, '2025-09-04', '02:51', 12),
(288, 12, 'Sales', 43, 3, 1, 2, '2025-09-04', '03:17', 12),
(289, 12, 'Sales', 48, 15, 1, 14, '2025-09-05', '14:31', 12),
(290, 12, 'Sales', 48, 15, 1, 14, '2025-09-05', '14:33', 12),
(291, 12, 'Sales', 48, 14, 1, 13, '2025-09-05', '14:42', 12),
(292, 12, 'Sales', 43, 2, 1, 1, '2025-09-05', '15:15', 12),
(293, 12, 'Sales', 63, 1, 1, 0, '2025-09-05', '15:26', 12),
(294, 12, 'Sales', 69, 11, 1, 10, '2025-09-05', '15:40', 12),
(295, 12, 'Sales', 52, 7, 1, 6, '2025-09-05', '23:41', 12),
(296, 12, 'Sales', 70, 1, 1, 0, '2025-09-05', '23:53', 12),
(297, 12, 'Sales', 43, 1, 1, 0, '2025-09-06', '00:01', 12),
(298, 12, 'Sales', 52, 6, 1, 5, '2025-09-07', '01:14', 12),
(299, 12, 'Sales', 64, 11, 1, 10, '2025-09-11', '12:49', 12),
(300, 12, 'Stock In', 19, 0, 1, 1, '2025-09-11', '14:02', 8),
(301, 12, 'Stock In', 20, 0, 1, 1, '2025-09-11', '14:02', 8),
(302, 12, 'Stock In', 21, 0, 1, 1, '2025-09-11', '14:02', 8),
(303, 12, 'Stock In', 43, 0, 1, 1, '2025-09-11', '14:02', 8),
(304, 12, 'Stock In', 47, 0, 1, 1, '2025-09-11', '14:02', 8),
(305, 12, 'Stock In', 63, 0, 1, 1, '2025-09-11', '14:02', 8),
(306, 12, 'Stock In', 70, 0, 1, 1, '2025-09-11', '14:02', 8),
(307, 14, 'Stock In', 44, 0, 1, 1, '2025-09-14', '00:53', 8),
(308, 14, 'Stock In', 48, 0, 5, 5, '2025-09-14', '00:53', 8),
(309, 14, 'Stock In', 20, 0, 2, 2, '2025-09-14', '01:02', 8),
(310, 14, 'Stock In', 21, 0, 1, 1, '2025-09-14', '01:02', 8),
(311, 14, 'Stock In', 43, 0, 1, 1, '2025-09-14', '01:02', 8),
(312, 14, 'Stock In', 47, 0, 1, 1, '2025-09-14', '01:02', 8),
(313, 14, 'Stock In', 63, 0, 1, 1, '2025-09-14', '01:02', 8),
(314, 12, 'Stock In', 50, 11, 2, 13, '2025-09-14', '01:17', 8),
(315, 12, 'Stock In', 68, 2, 2, 4, '2025-09-14', '01:17', 8),
(316, 12, 'Stock In', 72, 11, 2, 13, '2025-09-14', '01:17', 8),
(317, 14, 'Sales', 47, 1, 1, 0, '2025-09-14', '06:25', 16),
(318, 12, 'Sales', 69, 10, 1, 9, '2025-09-24', '10:48', 12),
(319, 12, 'Sales', 50, 13, 1, 12, '2025-09-24', '11:07', 12),
(320, 12, 'Sales', 68, 4, 1, 3, '2025-09-24', '13:10', 12),
(321, 12, 'Sales', 21, 1, 1, 0, '2025-09-24', '13:10', 12),
(322, 14, 'Sales', 43, 1, 1, 0, '2025-09-25', '13:17', 16),
(323, 12, 'Sales', 47, 1, 1, 0, '2025-08-26', '20:58', 12),
(324, 12, 'Sales', 69, 9, 1, 8, '2025-09-29', '08:19', 12);

-- --------------------------------------------------------

--
-- Table structure for table `transfer_stock`
--

CREATE TABLE `transfer_stock` (
  `ts_id` int(50) NOT NULL,
  `request_stock_id` int(10) NOT NULL,
  `location_id_sender` int(50) NOT NULL,
  `location_id_receiver` int(50) NOT NULL,
  `date` date NOT NULL,
  `current_status` varchar(100) NOT NULL,
  `account_id` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transfer_stock_details`
--

CREATE TABLE `transfer_stock_details` (
  `tsd_id` int(50) NOT NULL,
  `ts_id` int(50) NOT NULL,
  `product_id` int(50) NOT NULL,
  `qty` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transfer_stock_reports`
--

CREATE TABLE `transfer_stock_reports` (
  `tsr_id` int(50) NOT NULL,
  `ts_id` int(50) NOT NULL,
  `date` date NOT NULL,
  `time` time(6) NOT NULL,
  `status` varchar(50) NOT NULL,
  `account_id` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `unavailable_products`
--

CREATE TABLE `unavailable_products` (
  `unavailable_id` int(11) NOT NULL,
  `ts_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `walk_in_sales`
--

CREATE TABLE `walk_in_sales` (
  `wis_id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL,
  `discount_percentage` int(10) NOT NULL,
  `final_total_amount` decimal(10,2) NOT NULL,
  `total_qty_purchase` int(10) NOT NULL,
  `payment_method` varchar(100) NOT NULL,
  `payment_status` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `walk_in_sales`
--

INSERT INTO `walk_in_sales` (`wis_id`, `invoice_id`, `total_amount`, `discount`, `discount_percentage`, `final_total_amount`, `total_qty_purchase`, `payment_method`, `payment_status`) VALUES
(3, 8, 27500.00, 0.00, 0, 27500.00, 1, 'cash', 'Paid'),
(4, 9, 25500.00, 7650.00, 30, 17850.00, 1, 'cash', 'Paid'),
(5, 13, 27500.00, 8250.00, 30, 19250.00, 1, 'cash', 'Paid'),
(7, 15, 59400.00, 17820.00, 30, 41580.00, 2, 'cash', 'Paid'),
(8, 16, 32300.00, 9690.00, 30, 22610.00, 1, 'cash', 'Paid'),
(9, 22, 27500.00, 8250.00, 30, 19250.00, 1, 'cash', 'Paid'),
(10, 23, 33400.00, 10020.00, 30, 23380.00, 1, 'cash', 'Paid'),
(11, 24, 57200.00, 17160.00, 30, 40040.00, 2, 'cash', 'Paid'),
(12, 26, 29700.00, 8910.00, 30, 20790.00, 1, 'cash', 'Paid'),
(13, 28, 27500.00, 8250.00, 30, 19250.00, 1, 'cash', 'Paid'),
(14, 30, 29700.00, 8910.00, 30, 20790.00, 1, 'cash', 'Paid'),
(15, 31, 29700.00, 8910.00, 30, 20790.00, 1, 'cash', 'Paid'),
(17, 33, 55000.00, 16500.00, 30, 38500.00, 2, 'cash', 'Paid'),
(18, 37, 57800.00, 17340.00, 30, 40460.00, 2, 'cash', 'Paid'),
(19, 40, 25500.00, 7650.00, 30, 17850.00, 1, 'cash', 'Paid');

-- --------------------------------------------------------

--
-- Table structure for table `walk_in_sales_details`
--

CREATE TABLE `walk_in_sales_details` (
  `walk_in_sale_details` int(11) NOT NULL,
  `wis_id` int(10) NOT NULL,
  `product_id` int(10) NOT NULL,
  `qty` int(10) NOT NULL,
  `price_per_qty` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `walk_in_sales_details`
--

INSERT INTO `walk_in_sales_details` (`walk_in_sale_details`, `wis_id`, `product_id`, `qty`, `price_per_qty`, `total_price`) VALUES
(1, 3, 47, 1, 27500.00, 27500.00),
(2, 4, 43, 1, 25500.00, 25500.00),
(3, 5, 47, 1, 27500.00, 27500.00),
(5, 7, 21, 2, 29700.00, 59400.00),
(6, 8, 63, 1, 32300.00, 32300.00),
(7, 9, 47, 1, 27500.00, 27500.00),
(8, 10, 20, 1, 33400.00, 33400.00),
(9, 11, 47, 1, 27500.00, 27500.00),
(10, 11, 21, 1, 29700.00, 29700.00),
(11, 12, 21, 1, 29700.00, 29700.00),
(12, 13, 47, 1, 27500.00, 27500.00),
(13, 14, 21, 1, 29700.00, 29700.00),
(14, 15, 21, 1, 29700.00, 29700.00),
(16, 17, 47, 2, 27500.00, 55000.00),
(17, 18, 43, 1, 25500.00, 25500.00),
(18, 18, 63, 1, 32300.00, 32300.00),
(19, 19, 43, 1, 25500.00, 25500.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`account_id`),
  ADD KEY `account_id` (`account_id`,`role_id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `location_id` (`location_id`);

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`activity_log_id`),
  ADD KEY `activity_log_id` (`activity_log_id`,`account_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `branch`
--
ALTER TABLE `branch`
  ADD PRIMARY KEY (`branch_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`cust_id`),
  ADD KEY `cust_id` (`cust_id`);

--
-- Indexes for table `customer_accounts`
--
ALTER TABLE `customer_accounts`
  ADD PRIMARY KEY (`cust_account_id`),
  ADD KEY `cust_account_id` (`cust_account_id`);

--
-- Indexes for table `customer_cart`
--
ALTER TABLE `customer_cart`
  ADD PRIMARY KEY (`c_cart_id`),
  ADD KEY `c_cart_id` (`c_cart_id`,`cust_account_id`,`product_id`,`session_id`),
  ADD KEY `cust_account_id` (`cust_account_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `session_id` (`session_id`);

--
-- Indexes for table `customer_sales`
--
ALTER TABLE `customer_sales`
  ADD PRIMARY KEY (`customer_sales_id`),
  ADD KEY `customer_sales` (`customer_sales_id`,`invoice_id`,`cust_id`),
  ADD KEY `invoice_id` (`invoice_id`),
  ADD KEY `customer_sales_id` (`customer_sales_id`),
  ADD KEY `cust_id` (`cust_id`);

--
-- Indexes for table `customer_sales_details`
--
ALTER TABLE `customer_sales_details`
  ADD PRIMARY KEY (`c_sale_details`),
  ADD KEY `c_sale_details` (`c_sale_details`,`customer_sales_id`,`product_id`),
  ADD KEY `customer_sales_id` (`customer_sales_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `customized_product`
--
ALTER TABLE `customized_product`
  ADD PRIMARY KEY (`customized_id`),
  ADD KEY `customized_id` (`customized_id`,`customized_req_id`),
  ADD KEY `customized_req_id` (`customized_req_id`);

--
-- Indexes for table `customized_product_pricing`
--
ALTER TABLE `customized_product_pricing`
  ADD PRIMARY KEY (`cpp_id`),
  ADD KEY `cpp_id` (`cpp_id`,`customized_req_id`,`account_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `customized_req_id` (`customized_req_id`);

--
-- Indexes for table `customized_product_request`
--
ALTER TABLE `customized_product_request`
  ADD PRIMARY KEY (`customized_req_id`),
  ADD KEY `customized_req_id` (`customized_req_id`,`cust_account_id`,`base_product_id`),
  ADD KEY `cust_account_id` (`cust_account_id`),
  ADD KEY `base_product_id` (`base_product_id`);

--
-- Indexes for table `customized_product_update`
--
ALTER TABLE `customized_product_update`
  ADD PRIMARY KEY (`cpu_id`),
  ADD KEY `cpu_id` (`cpu_id`,`customized_id`,`account_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `customized_id` (`customized_id`);

--
-- Indexes for table `delivery_charge`
--
ALTER TABLE `delivery_charge`
  ADD PRIMARY KEY (`dc_id`),
  ADD KEY `dc_id` (`dc_id`);

--
-- Indexes for table `delivery_details`
--
ALTER TABLE `delivery_details`
  ADD PRIMARY KEY (`delivery_id`),
  ADD KEY `delivery_id` (`delivery_id`,`dc_id`,`account_id`,`sales_id`,`exchange_id`,`location_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `location_id` (`location_id`),
  ADD KEY `sales_id` (`sales_id`),
  ADD KEY `exchange_id` (`exchange_id`);

--
-- Indexes for table `deliver_transfer`
--
ALTER TABLE `deliver_transfer`
  ADD PRIMARY KEY (`dt_id`),
  ADD KEY `ts_id` (`ts_id`,`account_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `exchange_item`
--
ALTER TABLE `exchange_item`
  ADD PRIMARY KEY (`exchange_id`),
  ADD KEY `exhange_id` (`exchange_id`,`sales_id`,`location_id`,`account_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `location_id` (`location_id`),
  ADD KEY `sales_id` (`sales_id`);

--
-- Indexes for table `exchange_item_details`
--
ALTER TABLE `exchange_item_details`
  ADD PRIMARY KEY (`exchange_details_id`),
  ADD KEY `exchange_details_id` (`exchange_details_id`,`exchange_id`,`original_product_id`,`new_product_id`),
  ADD KEY `exchange_id` (`exchange_id`);

--
-- Indexes for table `guest`
--
ALTER TABLE `guest`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `session_id` (`session_id`);

--
-- Indexes for table `installment_payment_record`
--
ALTER TABLE `installment_payment_record`
  ADD PRIMARY KEY (`ipr_id`),
  ADD KEY `invoice_id` (`invoice_id`,`ips_id`),
  ADD KEY `ips_id` (`ips_id`);

--
-- Indexes for table `installment_payment_sched`
--
ALTER TABLE `installment_payment_sched`
  ADD PRIMARY KEY (`ips_id`),
  ADD KEY `ips_id` (`ips_id`,`installment_id`),
  ADD KEY `installment_id` (`installment_id`);

--
-- Indexes for table `installment_sales`
--
ALTER TABLE `installment_sales`
  ADD PRIMARY KEY (`installment_sales_id`),
  ADD KEY `installment_sales_id` (`installment_sales_id`,`invoice_id`,`cust_id`),
  ADD KEY `cust_id` (`cust_id`),
  ADD KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`invoice_id`),
  ADD KEY `invoice_id` (`invoice_id`,`location_id`,`account_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `location_id` (`location_id`);

--
-- Indexes for table `invoice_details`
--
ALTER TABLE `invoice_details`
  ADD PRIMARY KEY (`invoice_details_id`),
  ADD KEY `invoice_details_id` (`invoice_details_id`,`invoice_id`,`product_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`location_id`),
  ADD KEY `location_id` (`location_id`,`branch_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `product_id` (`product_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `request_approved`
--
ALTER TABLE `request_approved`
  ADD PRIMARY KEY (`request_approved_id`),
  ADD KEY `request_stock_id` (`request_stock_id`,`approved_by`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `request_deliver`
--
ALTER TABLE `request_deliver`
  ADD PRIMARY KEY (`r_deliver_id`),
  ADD KEY `request_stock_id` (`request_stock_id`,`account_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `request_reports`
--
ALTER TABLE `request_reports`
  ADD PRIMARY KEY (`rr_id`),
  ADD KEY `request_stock_id` (`request_stock_id`,`account_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `request_stock`
--
ALTER TABLE `request_stock`
  ADD PRIMARY KEY (`request_stock_id`),
  ADD KEY `request_from` (`request_from`,`request_to`),
  ADD KEY `request_to` (`request_to`),
  ADD KEY `request_by` (`request_by`);

--
-- Indexes for table `request_stock_details`
--
ALTER TABLE `request_stock_details`
  ADD PRIMARY KEY (`request_stock__details_id`),
  ADD KEY `request__stock_id` (`request__stock_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `stock_adjustment`
--
ALTER TABLE `stock_adjustment`
  ADD PRIMARY KEY (`sa_id`),
  ADD KEY `sa_id` (`sa_id`,`account_id`,`location_id`),
  ADD KEY `location_id` (`location_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `stock_adjustment_details`
--
ALTER TABLE `stock_adjustment_details`
  ADD PRIMARY KEY (`sad_id`),
  ADD KEY `sad_id` (`sad_id`,`sa_id`,`product_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `sa_id` (`sa_id`);

--
-- Indexes for table `stock_receiving`
--
ALTER TABLE `stock_receiving`
  ADD PRIMARY KEY (`stock_receiving_id`),
  ADD KEY `stock_receiving_id` (`stock_receiving_id`,`account_id`,`location_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `location_id` (`location_id`);

--
-- Indexes for table `stock_receiving_details`
--
ALTER TABLE `stock_receiving_details`
  ADD PRIMARY KEY (`srd_id`),
  ADD KEY `srd_id` (`srd_id`,`product_id`,`stock_receiving_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `stock_receiving_id` (`stock_receiving_id`);

--
-- Indexes for table `store_inventory`
--
ALTER TABLE `store_inventory`
  ADD PRIMARY KEY (`store_inventory_id`),
  ADD KEY `store_inventory_id` (`store_inventory_id`,`location_id`,`product_id`),
  ADD KEY `location_id` (`location_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `store_inventory_transaction_ledger`
--
ALTER TABLE `store_inventory_transaction_ledger`
  ADD PRIMARY KEY (`sir_id`),
  ADD KEY `sir_id` (`sir_id`,`location_id`,`account_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `store_inventory_id` (`location_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `transfer_stock`
--
ALTER TABLE `transfer_stock`
  ADD PRIMARY KEY (`ts_id`),
  ADD KEY `ts_id` (`ts_id`,`location_id_sender`,`location_id_receiver`,`account_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `request_stock_id` (`request_stock_id`);

--
-- Indexes for table `transfer_stock_details`
--
ALTER TABLE `transfer_stock_details`
  ADD PRIMARY KEY (`tsd_id`),
  ADD KEY `tsd_id` (`tsd_id`,`ts_id`,`product_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `ts_id` (`ts_id`);

--
-- Indexes for table `transfer_stock_reports`
--
ALTER TABLE `transfer_stock_reports`
  ADD PRIMARY KEY (`tsr_id`),
  ADD KEY `tsr_id` (`tsr_id`,`ts_id`,`account_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `ts_id` (`ts_id`);

--
-- Indexes for table `unavailable_products`
--
ALTER TABLE `unavailable_products`
  ADD PRIMARY KEY (`unavailable_id`),
  ADD KEY `request_stock_id` (`ts_id`,`product_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `ts_id` (`ts_id`);

--
-- Indexes for table `walk_in_sales`
--
ALTER TABLE `walk_in_sales`
  ADD PRIMARY KEY (`wis_id`),
  ADD KEY `wis_id` (`wis_id`,`invoice_id`),
  ADD KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `walk_in_sales_details`
--
ALTER TABLE `walk_in_sales_details`
  ADD PRIMARY KEY (`walk_in_sale_details`),
  ADD KEY `walk_in_sale_details` (`walk_in_sale_details`,`wis_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `wis_id` (`wis_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account`
--
ALTER TABLE `account`
  MODIFY `account_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `activity_log_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2378;

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `branch_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `category_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `cust_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `customer_accounts`
--
ALTER TABLE `customer_accounts`
  MODIFY `cust_account_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customer_cart`
--
ALTER TABLE `customer_cart`
  MODIFY `c_cart_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customer_sales`
--
ALTER TABLE `customer_sales`
  MODIFY `customer_sales_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `customer_sales_details`
--
ALTER TABLE `customer_sales_details`
  MODIFY `c_sale_details` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `customized_product`
--
ALTER TABLE `customized_product`
  MODIFY `customized_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customized_product_pricing`
--
ALTER TABLE `customized_product_pricing`
  MODIFY `cpp_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customized_product_request`
--
ALTER TABLE `customized_product_request`
  MODIFY `customized_req_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customized_product_update`
--
ALTER TABLE `customized_product_update`
  MODIFY `cpu_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `delivery_charge`
--
ALTER TABLE `delivery_charge`
  MODIFY `dc_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `delivery_details`
--
ALTER TABLE `delivery_details`
  MODIFY `delivery_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deliver_transfer`
--
ALTER TABLE `deliver_transfer`
  MODIFY `dt_id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `exchange_item`
--
ALTER TABLE `exchange_item`
  MODIFY `exchange_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exchange_item_details`
--
ALTER TABLE `exchange_item_details`
  MODIFY `exchange_details_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guest`
--
ALTER TABLE `guest`
  MODIFY `session_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `installment_payment_record`
--
ALTER TABLE `installment_payment_record`
  MODIFY `ipr_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `installment_payment_sched`
--
ALTER TABLE `installment_payment_sched`
  MODIFY `ips_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `installment_sales`
--
ALTER TABLE `installment_sales`
  MODIFY `installment_sales_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `invoice`
--
ALTER TABLE `invoice`
  MODIFY `invoice_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `invoice_details`
--
ALTER TABLE `invoice_details`
  MODIFY `invoice_details_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `location`
--
ALTER TABLE `location`
  MODIFY `location_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `request_approved`
--
ALTER TABLE `request_approved`
  MODIFY `request_approved_id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `request_deliver`
--
ALTER TABLE `request_deliver`
  MODIFY `r_deliver_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `request_reports`
--
ALTER TABLE `request_reports`
  MODIFY `rr_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=234;

--
-- AUTO_INCREMENT for table `request_stock`
--
ALTER TABLE `request_stock`
  MODIFY `request_stock_id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `request_stock_details`
--
ALTER TABLE `request_stock_details`
  MODIFY `request_stock__details_id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=250;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `role_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `stock_adjustment`
--
ALTER TABLE `stock_adjustment`
  MODIFY `sa_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_adjustment_details`
--
ALTER TABLE `stock_adjustment_details`
  MODIFY `sad_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_receiving`
--
ALTER TABLE `stock_receiving`
  MODIFY `stock_receiving_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `stock_receiving_details`
--
ALTER TABLE `stock_receiving_details`
  MODIFY `srd_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `store_inventory`
--
ALTER TABLE `store_inventory`
  MODIFY `store_inventory_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `store_inventory_transaction_ledger`
--
ALTER TABLE `store_inventory_transaction_ledger`
  MODIFY `sir_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=325;

--
-- AUTO_INCREMENT for table `transfer_stock`
--
ALTER TABLE `transfer_stock`
  MODIFY `ts_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `transfer_stock_details`
--
ALTER TABLE `transfer_stock_details`
  MODIFY `tsd_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `transfer_stock_reports`
--
ALTER TABLE `transfer_stock_reports`
  MODIFY `tsr_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `unavailable_products`
--
ALTER TABLE `unavailable_products`
  MODIFY `unavailable_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `walk_in_sales`
--
ALTER TABLE `walk_in_sales`
  MODIFY `wis_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `walk_in_sales_details`
--
ALTER TABLE `walk_in_sales_details`
  MODIFY `walk_in_sale_details` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account`
--
ALTER TABLE `account`
  ADD CONSTRAINT `account_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `account_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD CONSTRAINT `activity_log_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customer_cart`
--
ALTER TABLE `customer_cart`
  ADD CONSTRAINT `customer_cart_ibfk_1` FOREIGN KEY (`cust_account_id`) REFERENCES `customer_accounts` (`cust_account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customer_cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customer_cart_ibfk_3` FOREIGN KEY (`session_id`) REFERENCES `guest` (`session_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customer_sales`
--
ALTER TABLE `customer_sales`
  ADD CONSTRAINT `customer_sales_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`invoice_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customer_sales_ibfk_2` FOREIGN KEY (`cust_id`) REFERENCES `customers` (`cust_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customer_sales_details`
--
ALTER TABLE `customer_sales_details`
  ADD CONSTRAINT `customer_sales_details_ibfk_1` FOREIGN KEY (`customer_sales_id`) REFERENCES `customer_sales` (`customer_sales_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customer_sales_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customized_product`
--
ALTER TABLE `customized_product`
  ADD CONSTRAINT `customized_product_ibfk_1` FOREIGN KEY (`customized_req_id`) REFERENCES `customized_product_request` (`customized_req_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customized_product_pricing`
--
ALTER TABLE `customized_product_pricing`
  ADD CONSTRAINT `customized_product_pricing_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customized_product_pricing_ibfk_2` FOREIGN KEY (`customized_req_id`) REFERENCES `customized_product_request` (`customized_req_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customized_product_request`
--
ALTER TABLE `customized_product_request`
  ADD CONSTRAINT `customized_product_request_ibfk_1` FOREIGN KEY (`cust_account_id`) REFERENCES `customer_accounts` (`cust_account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customized_product_request_ibfk_2` FOREIGN KEY (`base_product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customized_product_update`
--
ALTER TABLE `customized_product_update`
  ADD CONSTRAINT `customized_product_update_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customized_product_update_ibfk_2` FOREIGN KEY (`customized_id`) REFERENCES `customized_product` (`customized_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `delivery_details`
--
ALTER TABLE `delivery_details`
  ADD CONSTRAINT `delivery_details_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `delivery_details_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `delivery_details_ibfk_4` FOREIGN KEY (`exchange_id`) REFERENCES `exchange_item` (`exchange_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `deliver_transfer`
--
ALTER TABLE `deliver_transfer`
  ADD CONSTRAINT `deliver_transfer_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deliver_transfer_ibfk_3` FOREIGN KEY (`ts_id`) REFERENCES `transfer_stock` (`ts_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `exchange_item`
--
ALTER TABLE `exchange_item`
  ADD CONSTRAINT `exchange_item_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `exchange_item_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `exchange_item_details`
--
ALTER TABLE `exchange_item_details`
  ADD CONSTRAINT `exchange_item_details_ibfk_1` FOREIGN KEY (`exchange_id`) REFERENCES `exchange_item` (`exchange_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `installment_payment_record`
--
ALTER TABLE `installment_payment_record`
  ADD CONSTRAINT `installment_payment_record_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`invoice_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `installment_payment_record_ibfk_2` FOREIGN KEY (`ips_id`) REFERENCES `installment_payment_sched` (`ips_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `installment_payment_sched`
--
ALTER TABLE `installment_payment_sched`
  ADD CONSTRAINT `installment_payment_sched_ibfk_1` FOREIGN KEY (`installment_id`) REFERENCES `installment_sales` (`installment_sales_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `installment_sales`
--
ALTER TABLE `installment_sales`
  ADD CONSTRAINT `installment_sales_ibfk_1` FOREIGN KEY (`cust_id`) REFERENCES `customers` (`cust_id`),
  ADD CONSTRAINT `installment_sales_ibfk_2` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`invoice_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoice`
--
ALTER TABLE `invoice`
  ADD CONSTRAINT `invoice_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoice_details`
--
ALTER TABLE `invoice_details`
  ADD CONSTRAINT `invoice_details_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `invoice_details_ibfk_2` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`invoice_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `location`
--
ALTER TABLE `location`
  ADD CONSTRAINT `location_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `request_approved`
--
ALTER TABLE `request_approved`
  ADD CONSTRAINT `request_approved_ibfk_1` FOREIGN KEY (`request_stock_id`) REFERENCES `request_stock` (`request_stock_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `request_approved_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `request_deliver`
--
ALTER TABLE `request_deliver`
  ADD CONSTRAINT `request_deliver_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `request_deliver_ibfk_2` FOREIGN KEY (`request_stock_id`) REFERENCES `request_stock` (`request_stock_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `request_reports`
--
ALTER TABLE `request_reports`
  ADD CONSTRAINT `request_reports_ibfk_1` FOREIGN KEY (`request_stock_id`) REFERENCES `request_stock` (`request_stock_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `request_reports_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `request_stock`
--
ALTER TABLE `request_stock`
  ADD CONSTRAINT `request_stock_ibfk_1` FOREIGN KEY (`request_from`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `request_stock_ibfk_2` FOREIGN KEY (`request_to`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `request_stock_ibfk_3` FOREIGN KEY (`request_by`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `request_stock_details`
--
ALTER TABLE `request_stock_details`
  ADD CONSTRAINT `request_stock_details_ibfk_1` FOREIGN KEY (`request__stock_id`) REFERENCES `request_stock` (`request_stock_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `request_stock_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stock_adjustment`
--
ALTER TABLE `stock_adjustment`
  ADD CONSTRAINT `stock_adjustment_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_adjustment_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stock_adjustment_details`
--
ALTER TABLE `stock_adjustment_details`
  ADD CONSTRAINT `stock_adjustment_details_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_adjustment_details_ibfk_2` FOREIGN KEY (`sa_id`) REFERENCES `stock_adjustment` (`sa_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stock_receiving`
--
ALTER TABLE `stock_receiving`
  ADD CONSTRAINT `stock_receiving_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_receiving_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stock_receiving_details`
--
ALTER TABLE `stock_receiving_details`
  ADD CONSTRAINT `stock_receiving_details_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_receiving_details_ibfk_2` FOREIGN KEY (`stock_receiving_id`) REFERENCES `stock_receiving` (`stock_receiving_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `store_inventory`
--
ALTER TABLE `store_inventory`
  ADD CONSTRAINT `store_inventory_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `store_inventory_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `store_inventory_transaction_ledger`
--
ALTER TABLE `store_inventory_transaction_ledger`
  ADD CONSTRAINT `store_inventory_transaction_ledger_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `store_inventory_transaction_ledger_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transfer_stock`
--
ALTER TABLE `transfer_stock`
  ADD CONSTRAINT `transfer_stock_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transfer_stock_ibfk_2` FOREIGN KEY (`request_stock_id`) REFERENCES `request_stock` (`request_stock_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transfer_stock_details`
--
ALTER TABLE `transfer_stock_details`
  ADD CONSTRAINT `transfer_stock_details_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transfer_stock_details_ibfk_2` FOREIGN KEY (`ts_id`) REFERENCES `transfer_stock` (`ts_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transfer_stock_reports`
--
ALTER TABLE `transfer_stock_reports`
  ADD CONSTRAINT `transfer_stock_reports_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transfer_stock_reports_ibfk_2` FOREIGN KEY (`ts_id`) REFERENCES `transfer_stock` (`ts_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `unavailable_products`
--
ALTER TABLE `unavailable_products`
  ADD CONSTRAINT `unavailable_products_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `unavailable_products_ibfk_2` FOREIGN KEY (`ts_id`) REFERENCES `transfer_stock` (`ts_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `walk_in_sales`
--
ALTER TABLE `walk_in_sales`
  ADD CONSTRAINT `walk_in_sales_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`invoice_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `walk_in_sales_details`
--
ALTER TABLE `walk_in_sales_details`
  ADD CONSTRAINT `walk_in_sales_details_ibfk_1` FOREIGN KEY (`wis_id`) REFERENCES `walk_in_sales` (`wis_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `walk_in_sales_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
