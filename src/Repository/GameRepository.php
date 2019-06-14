<?php

namespace App\Repository;

use App\Entity\Game;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method Game|null find($id, $lockMode = null, $lockVersion = null)
 * @method Game|null findOneBy(array $criteria, array $orderBy = null)
 * @method Game[]    findAll()
 * @method Game[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class GameRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, Game::class);
    }

    public function findGamesByWorld($user, $world)
    {
      return $this->createQueryBuilder('g')
        ->andWhere('g.user = :user')
        ->andWhere('g.world = :world')
        ->setParameters(array('world'=> $world, 'user' => $user))
        ->orderBy('g.id', 'ASC')
        ->getQuery()
        ->getResult()
      ;
    }
    public function findGameBySlug($user, $world, $slug)
    {
      return $this->createQueryBuilder('g')
        ->andWhere('g.user = :user')
        ->andWhere('g.world = :world')
        ->andWhere('g.slug = :slug')
        ->setParameters(array('user' => $user, 'world'=> $world, 'slug' => $slug))
        ->orderBy('g.id', 'ASC')
        ->getQuery()
        ->getOneOrNullResult()
      ;
    }
    public function findLatestGameFromAll()
    {
      return $this->createQueryBuilder('g')
        ->orderBy('g.id', 'DESC')
        ->getQuery()
        ->getOneOrNullResult()
      ;
    }
    // /**
    //  * @return Game[] Returns an array of Game objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('g')
            ->andWhere('g.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('g.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Game
    {
        return $this->createQueryBuilder('g')
            ->andWhere('g.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
