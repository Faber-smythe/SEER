<?php

namespace App\Repository;

use App\Entity\World;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * @method World|null find($id, $lockMode = null, $lockVersion = null)
 * @method World|null findOneBy(array $criteria, array $orderBy = null)
 * @method World[]    findAll()
 * @method World[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class WorldRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, World::class);
    }

    // /**
    //  * @return World[] Returns an array of World objects
    //  */

    public function findAllWorlds($user)
    {

      return $this->createQueryBuilder('w')
        ->andWhere('w.user = :val')
        ->setParameter('val', $user)
        ->orderBy('w.id', 'ASC')
        ->getQuery()
        ->getResult()
      ;
    }
    public function findWorldBySlug($user, $slug)
    {
      return $this->createQueryBuilder('w')
        ->andWhere('w.user = :user')
        ->andWhere('w.slug = :slug')
        ->setParameters(array('slug'=> $slug, 'user' => $user))
        ->getQuery()
        ->getOneOrNullResult()
      ;
    }
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('w')
            ->andWhere('w.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('w.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?World
    {
        return $this->createQueryBuilder('w')
            ->andWhere('w.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
