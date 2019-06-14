<?php

namespace App\Form;

use App\Entity\ItemImage;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\FileType;

class ItemImageType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $this->fileindication = $options['fileindication'];
        $builder
            ->add('name', null, [
              'label' => 'Item Name',
            ])
            ->add('imageFile', FileType::class, [
                'label' => 'File',
                'help' => $this->fileindication
            ])
            ->add('comment', TextareaType::class, [
                'label' => 'Comment (optional)',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => ItemImage::class,
            'fileindication' => null,
        ]);
    }
}
